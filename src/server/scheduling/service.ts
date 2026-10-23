import "server-only";

import { createHash } from 'node:crypto';
import { getAdminDb } from '@/server/firebase';
import { addDays, addHours, isAfter, parseISO, subHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { cancelCalendarEvent, createCalendarEventForBooking, getAvailableSchedulingSlots, getCalendarEventState, getSchedulingTimezone, getSchedulingTutorEmail, isGoogleCalendarConfigured, listCalendarEventsForDate, updateCalendarEventMarker } from '@/server/integrations/google-calendar';
import type { AdminSchedulingSnapshot, LiveSessionAvailabilitySlot, LiveSessionBooking, LiveSessionStatusPayload, SchedulingDayOverview } from '@/server/scheduling/types';

const COLLECTION = 'live_sessions';
const SLOT_LOCKS_COLLECTION = 'live_session_slot_locks';
const PURCHASE_WINDOW_DAYS = 7;
const RESCHEDULE_DEADLINE_HOURS = 24;
const PENDING_CONFIRMATION_TIMEOUT_HOURS = 24;

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

function nowIso() {
  return new Date().toISOString();
}

// Historical storage key retained to avoid migrating or duplicating existing reservations.
function getSessionId(userId: string) { return `${userId}_p2`; }

function getSlotLockId(slotStart: string, slotEnd: string) {
  return createHash('sha256').update(`${slotStart}|${slotEnd}`).digest('hex');
}

async function updateSessionAndReleaseSlot(options: {
  sessionId: string;
  expectedStatuses: LiveSessionBooking['status'][];
  expectedSlotStart?: string | null;
  update: Partial<LiveSessionBooking>;
}) {
  const sessionRef = getAdminDb().collection(COLLECTION).doc(options.sessionId);
  let updatedSession: LiveSessionBooking | null = null;

  await getAdminDb().runTransaction(async (transaction) => {
    const sessionSnapshot = await transaction.get(sessionRef);
    if (!sessionSnapshot.exists) {
      throw new Error('SESSION_NOT_FOUND');
    }

    const current = {
      id: sessionSnapshot.id,
      ...(sessionSnapshot.data() as LiveSessionBooking),
    } as LiveSessionBooking;

    if (!options.expectedStatuses.includes(current.status)) {
      throw new Error('SESSION_STATE_CHANGED');
    }

    if (
      options.expectedSlotStart !== undefined &&
      current.requestedSlotStart !== options.expectedSlotStart
    ) {
      throw new Error('SESSION_STATE_CHANGED');
    }

    const currentLockId = current.slotLockId || (
      current.requestedSlotStart && current.requestedSlotEnd
        ? getSlotLockId(current.requestedSlotStart, current.requestedSlotEnd)
        : null
    );
    const lockRef = currentLockId
      ? getAdminDb().collection(SLOT_LOCKS_COLLECTION).doc(currentLockId)
      : null;
    const lockSnapshot = lockRef ? await transaction.get(lockRef) : null;

    const patch = stripUndefined({
      ...options.update,
      slotLockId: null,
    });
    transaction.set(sessionRef, patch, { merge: true });

    if (
      lockRef &&
      lockSnapshot?.exists &&
      lockSnapshot.data()?.sessionId === current.id &&
      lockSnapshot.data()?.userId === current.userId
    ) {
      transaction.delete(lockRef);
    }

    updatedSession = {
      ...current,
      ...patch,
    } as LiveSessionBooking;
  });

  return updatedSession;
}

function getEarliestScheduleAt(premiumActivatedAt?: string) {
  if (!premiumActivatedAt) return nowIso();
  return addDays(parseISO(premiumActivatedAt), PURCHASE_WINDOW_DAYS).toISOString();
}

async function getUserProfile(userId: string) {
  const snapshot = await getAdminDb().collection('users').doc(userId).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as Record<string, unknown>;
}

export async function getLiveSession(userId: string) {
  const snapshot = await getAdminDb().collection(COLLECTION).doc(getSessionId(userId)).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...(snapshot.data() as LiveSessionBooking) } as LiveSessionBooking;
}

export async function releaseLiveSession(options: {
  userId: string;
  sourcePillarId?: number;
  examId?: string;
}) {
  const user = await getUserProfile(options.userId);
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const premiumActivatedAt = typeof user.premiumActivatedAt === 'string'
    ? user.premiumActivatedAt
    : typeof user.createdAt === 'string'
      ? user.createdAt
      : nowIso();

  const earliestScheduleAt = getEarliestScheduleAt(premiumActivatedAt);
  const sessionId = getSessionId(options.userId);
  const current = await getLiveSession(options.userId);
  const currentStatus = current?.status;
  const nextStatus = currentStatus === 'confirmed' || currentStatus === 'completed'
    ? currentStatus
    : isAfter(parseISO(earliestScheduleAt), new Date())
      ? 'awaiting_release_window'
      : 'ready_to_schedule';

  const session: LiveSessionBooking = {
    id: sessionId,
    userId: options.userId,
    sourcePillarId: options.sourcePillarId ?? 2,
    examId: options.examId,
    title: 'Primeira aula ao vivo',
    status: nextStatus,
    studentName: typeof user.name === 'string' ? user.name : undefined,
    studentEmail: typeof user.email === 'string' ? user.email : undefined,
    studentPhone: typeof user.phone === 'string' ? user.phone : undefined,
    tutorEmail: getSchedulingTutorEmail(),
    premiumActivatedAt,
    earliestScheduleAt,
    releasedAt: nowIso(),
    createdAt: current?.createdAt || nowIso(),
    updatedAt: nowIso(),
    requestedSlotStart: current?.requestedSlotStart,
    requestedSlotEnd: current?.requestedSlotEnd,
    calendarEventId: current?.calendarEventId,
    calendarHtmlLink: current?.calendarHtmlLink,
    confirmedAt: current?.confirmedAt,
    completedAt: current?.completedAt,
    cancelledAt: current?.cancelledAt,
    lastActionMessage: nextStatus === 'awaiting_release_window'
      ? 'Sua sessão foi liberada, mas os horários só aparecem quando você entra na janela segura da compra.'
      : 'Sua primeira sessão ao vivo já pode ser marcada.',
  };

  await getAdminDb().collection(COLLECTION).doc(sessionId).set(stripUndefined(session), { merge: true });

  return session;
}

async function syncSessionWithCalendar(session: LiveSessionBooking) {
  if (!session.calendarEventId) return session;

  const calendarState = await getCalendarEventState(session.calendarEventId);
  if (!calendarState) return session;

  let nextStatus = session.status;
  let nextMessage = session.lastActionMessage;
  const normalizedSummary = calendarState.summary?.toUpperCase() || '';
  const confirmedByMarker = normalizedSummary.includes('[CONFIRMADO]') || normalizedSummary.includes('[OK]');
  const rejectedByMarker = normalizedSummary.includes('[RECUSAR]') || normalizedSummary.includes('[CANCELAR]');

  if (calendarState.status === 'cancelled' || rejectedByMarker) {
    nextStatus = 'ready_to_schedule';
    nextMessage = 'Esse horário não foi confirmado. Escolha outro horário para continuar.';
  } else if (confirmedByMarker) {
    nextStatus = 'confirmed';
    nextMessage = 'Sua aula ao vivo foi confirmada. O Pilar 3 já está liberado para você continuar.';
  }

  if (nextStatus !== session.status || calendarState.htmlLink !== session.calendarHtmlLink) {
    const updatedSession: Partial<LiveSessionBooking> = {
      status: nextStatus,
      calendarHtmlLink: calendarState.htmlLink,
      updatedAt: nowIso(),
      lastActionMessage: nextMessage,
      ...(nextStatus === 'confirmed' ? { confirmedAt: session.confirmedAt || nowIso() } : {}),
      ...(nextStatus === 'ready_to_schedule' ? {
        requestedSlotStart: null,
        requestedSlotEnd: null,
        calendarEventId: null,
        calendarHtmlLink: null,
        cancelledAt: nowIso(),
      } : {}),
    };

    const persistedSession = nextStatus === 'ready_to_schedule'
      ? await updateSessionAndReleaseSlot({
          sessionId: session.id!,
          expectedStatuses: [session.status],
          expectedSlotStart: session.requestedSlotStart,
          update: updatedSession,
        })
      : null;

    if (nextStatus !== 'ready_to_schedule') {
      await getAdminDb().collection(COLLECTION).doc(session.id!).set(stripUndefined(updatedSession), { merge: true });
    }


    return persistedSession || {
      ...session,
      ...updatedSession,
      status: nextStatus,
      calendarHtmlLink: nextStatus === 'ready_to_schedule' ? null : calendarState.htmlLink,
      requestedSlotStart: nextStatus === 'ready_to_schedule' ? null : session.requestedSlotStart,
      requestedSlotEnd: nextStatus === 'ready_to_schedule' ? null : session.requestedSlotEnd,
      calendarEventId: nextStatus === 'ready_to_schedule' ? null : session.calendarEventId,
    } as LiveSessionBooking;
  }

  return session;
}

async function expirePendingSessionIfNeeded(session: LiveSessionBooking) {
  if (session.status !== 'pending_confirmation' || !session.requestedSlotStart) {
    return session;
  }

  const pendingSince = session.updatedAt || session.createdAt || nowIso();
  const expiresAt = addHours(parseISO(pendingSince), PENDING_CONFIRMATION_TIMEOUT_HOURS);

  if (!isAfter(new Date(), expiresAt)) {
    return session;
  }

  if (session.calendarEventId) {
    await cancelCalendarEvent(session.calendarEventId);
  }

  const nextStatus = getReadyStatusFromSession(session);
  const expiredUpdate: Partial<LiveSessionBooking> = {
    status: nextStatus,
    requestedSlotStart: null,
    requestedSlotEnd: null,
    calendarEventId: null,
    calendarHtmlLink: null,
    confirmedAt: null,
    adminDecisionReason: null,
    cancelledAt: nowIso(),
    updatedAt: nowIso(),
    lastActionMessage: 'Seu pedido expirou automaticamente após 24 horas sem confirmação. Escolha um novo horário disponível.',
  };

  const updatedSession = await updateSessionAndReleaseSlot({
    sessionId: session.id!,
    expectedStatuses: ['pending_confirmation'],
    expectedSlotStart: session.requestedSlotStart,
    update: expiredUpdate,
  });


  return updatedSession || {
    ...session,
    ...expiredUpdate,
    status: nextStatus,
  } as LiveSessionBooking;
}

export async function getSchedulingStatusForUser(userId: string): Promise<LiveSessionStatusPayload> {
  const user = await getUserProfile(userId);
  const premiumStatus = user?.subscriptionStatus === 'premium';
  const timezone = getSchedulingTimezone();

  if (!premiumStatus) {
    return {
      isPremium: false,
      schedulingVisible: false,
      session: null,
      earliestScheduleAt: null,
      canRequestScheduling: false,
      canManageCurrentBooking: false,
      waitingReason: 'A área de agendamentos aparece depois da compra do Premium.',
      timezone,
    };
  }

  let session = await getLiveSession(userId);


  if (session) {
    session = await expirePendingSessionIfNeeded(session);
    session = await syncSessionWithCalendar(session);

    if (
      session.status === "awaiting_release_window" &&
      session.earliestScheduleAt &&
      !isAfter(parseISO(session.earliestScheduleAt), new Date())
    ) {
      const promoted = {
        status: "ready_to_schedule" as const,
        updatedAt: nowIso(),
        lastActionMessage: "Sua primeira sessão ao vivo já pode ser marcada.",
      };

      await getAdminDb().collection(COLLECTION).doc(session.id!).set(promoted, { merge: true });

      session = {
        ...session,
        ...promoted,
      };
    }
  }

  const premiumActivatedAt = typeof user?.premiumActivatedAt === 'string'
    ? user.premiumActivatedAt
    : typeof user?.createdAt === 'string'
      ? user.createdAt
      : nowIso();
  const earliestScheduleAt = session?.earliestScheduleAt || getEarliestScheduleAt(premiumActivatedAt);

  const waitingReason = !session
    ? 'Nenhuma sessão foi liberada para agendamento. A liberação deve ser feita por um serviço autorizado.'
    : session.status === 'awaiting_release_window'
      ? 'A sessão foi liberada, mas os horários só ficam visíveis a partir da janela segura da compra.'
      : session.status === 'pending_confirmation'
        ? 'Seu pedido foi enviado. Agora o tutor confirma esse horário no painel.'
        : session.status === 'confirmed'
          ? 'Sua sessão está confirmada e sua jornada já pode continuar normalmente.'
          : session.lastActionMessage || undefined;

  const canRequestScheduling = Boolean(session && (session.status === 'ready_to_schedule' || session.status === 'cancelled'));
  const canManageCurrentBooking = Boolean(session && session.requestedSlotStart && ['pending_confirmation', 'confirmed'].includes(session.status));

  return {
    isPremium: true,
    schedulingVisible: true,
    session,
    earliestScheduleAt,
    canRequestScheduling,
    canManageCurrentBooking,
    waitingReason,
    timezone,
  };
}

export async function getSchedulingAvailability(userId: string): Promise<LiveSessionAvailabilitySlot[]> {
  const status = await getSchedulingStatusForUser(userId);
  if (!status.session || !status.canRequestScheduling || !status.earliestScheduleAt) {
    return [];
  }

  if (!isGoogleCalendarConfigured()) {
    return [];
  }

  const slots = await getAvailableSchedulingSlots({
    earliestScheduleAt: status.earliestScheduleAt,
  });

  const reservedRanges = await getReservedSessionRanges(userId);

  return slots.filter((slot) => {
    const slotStart = parseISO(slot.start);
    const slotEnd = parseISO(slot.end);

    return !reservedRanges.some((range) => {
      const rangeStart = parseISO(range.start);
      const rangeEnd = parseISO(range.end);
      return slotStart < rangeEnd && slotEnd > rangeStart;
    });
  });
}

export async function requestLiveSessionBooking(options: {
  userId: string;
  slotStart: string;
  slotEnd: string;
  notes?: string;
}) {
  const status = await getSchedulingStatusForUser(options.userId);
  const isIdempotentRetry = Boolean(
    status.session?.status === 'pending_confirmation' &&
    status.session.requestedSlotStart === options.slotStart &&
    status.session.requestedSlotEnd === options.slotEnd
  );

  if (!status.session || (!status.canRequestScheduling && !isIdempotentRetry)) {
    throw new Error('SESSION_NOT_READY');
  }

  const bookingStart = parseISO(options.slotStart);
  if (isAfter(parseISO(status.earliestScheduleAt || nowIso()), bookingStart)) {
    throw new Error('SLOT_NOT_ALLOWED_YET');
  }

  if (!isIdempotentRetry) {
    const availableSlots = await getSchedulingAvailability(options.userId);
    const requestedSlotStillAvailable = availableSlots.some(
      (slot) => slot.start === options.slotStart && slot.end === options.slotEnd
    );

    if (!requestedSlotStillAvailable) {
      throw new Error('SLOT_NO_LONGER_AVAILABLE');
    }
  }

  const sessionId = status.session.id || getSessionId(options.userId);
  const sessionRef = getAdminDb().collection(COLLECTION).doc(sessionId);
  const slotLockId = getSlotLockId(options.slotStart, options.slotEnd);
  const slotLockRef = getAdminDb().collection(SLOT_LOCKS_COLLECTION).doc(slotLockId);

  const nextSession = await getAdminDb().runTransaction<LiveSessionBooking>(async (transaction) => {
    const [freshSessionSnapshot, slotLockSnapshot] = await Promise.all([
      transaction.get(sessionRef),
      transaction.get(slotLockRef),
    ]);

    if (!freshSessionSnapshot.exists) {
      throw new Error('SESSION_NOT_FOUND');
    }

    const freshSession = {
      id: freshSessionSnapshot.id,
      ...(freshSessionSnapshot.data() as LiveSessionBooking),
    } as LiveSessionBooking;

    if (freshSession.userId !== options.userId) {
      throw new Error('SESSION_OWNER_MISMATCH');
    }

    const alreadyReserved =
      freshSession.status === 'pending_confirmation' &&
      freshSession.requestedSlotStart === options.slotStart &&
      freshSession.requestedSlotEnd === options.slotEnd;

    if (alreadyReserved) {
      if (
        slotLockSnapshot.exists &&
        (slotLockSnapshot.data()?.sessionId !== sessionId ||
          slotLockSnapshot.data()?.userId !== options.userId)
      ) {
        throw new Error('SLOT_NO_LONGER_AVAILABLE');
      }

      const bookingRevision = Number(freshSession.bookingRevision || 1);
      if (!slotLockSnapshot.exists) {
        const timestamp = nowIso();
        transaction.set(slotLockRef, {
          slotStart: options.slotStart,
          slotEnd: options.slotEnd,
          userId: options.userId,
          sessionId,
          status: 'reserved',
          bookingRevision,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
        transaction.set(sessionRef, { slotLockId, bookingRevision, updatedAt: timestamp }, { merge: true });
      }

      return {
        ...freshSession,
        slotLockId,
        bookingRevision,
      };
    }

    if (!['ready_to_schedule', 'cancelled'].includes(freshSession.status)) {
      throw new Error('SESSION_STATE_CHANGED');
    }

    if (
      slotLockSnapshot.exists &&
      (slotLockSnapshot.data()?.sessionId !== sessionId ||
        slotLockSnapshot.data()?.userId !== options.userId)
    ) {
      throw new Error('SLOT_NO_LONGER_AVAILABLE');
    }

    const timestamp = nowIso();
    const bookingRevision = Number(freshSession.bookingRevision || 0) + 1;
    const reservedSession = stripUndefined({
      ...freshSession,
      id: sessionId,
      status: 'pending_confirmation' as const,
      requestedSlotStart: options.slotStart,
      requestedSlotEnd: options.slotEnd,
      slotLockId,
      bookingRevision,
      notes: options.notes,
      calendarEventId: null,
      calendarHtmlLink: null,
      confirmedAt: null,
      updatedAt: timestamp,
      lastActionMessage: 'Seu pedido foi enviado. Agora o tutor confirma esse horário no painel.',
      tutorEmail: freshSession.tutorEmail || getSchedulingTutorEmail(),
    }) as LiveSessionBooking;

    transaction.set(slotLockRef, {
      slotStart: options.slotStart,
      slotEnd: options.slotEnd,
      userId: options.userId,
      sessionId,
      status: 'reserved',
      bookingRevision,
      createdAt: slotLockSnapshot.exists
        ? slotLockSnapshot.data()?.createdAt || timestamp
        : timestamp,
      updatedAt: timestamp,
    });
    transaction.set(sessionRef, reservedSession, { merge: true });
    return reservedSession;
  });


  return nextSession;
}

export async function cancelLiveSessionBooking(userId: string) {
  const status = await getSchedulingStatusForUser(userId);
  if (!status.session || !status.canManageCurrentBooking) {
    throw new Error('SESSION_NOT_MANAGEABLE');
  }

  if (!status.session.requestedSlotStart) {
    throw new Error('SESSION_WITHOUT_SLOT');
  }

  const deadline = subHours(parseISO(status.session.requestedSlotStart), RESCHEDULE_DEADLINE_HOURS);
  if (isAfter(new Date(), deadline)) {
    throw new Error('RESCHEDULE_WINDOW_CLOSED');
  }

  if (status.session.calendarEventId) {
    await cancelCalendarEvent(status.session.calendarEventId);
  }

  const nextStatus = isAfter(parseISO(status.session.earliestScheduleAt || nowIso()), new Date())
    ? 'awaiting_release_window'
    : 'ready_to_schedule';

  await updateSessionAndReleaseSlot({
    sessionId: status.session.id!,
    expectedStatuses: [status.session.status],
    expectedSlotStart: status.session.requestedSlotStart,
    update: {
      status: nextStatus,
      requestedSlotStart: null,
      requestedSlotEnd: null,
      calendarEventId: null,
      calendarHtmlLink: null,
      cancelledAt: nowIso(),
      updatedAt: nowIso(),
      lastActionMessage: 'Seu pedido foi cancelado. Quando quiser, escolha um novo horário válido.',
    },
  });

}

export async function getAdminSchedulingSnapshot() {
  const snapshot = await getAdminDb().collection(COLLECTION).get();
  const sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as LiveSessionBooking) }));

  return {
    total: sessions.length,
    pendingConfirmation: sessions.filter((item) => item.status === 'pending_confirmation').length,
    confirmed: sessions.filter((item) => item.status === 'confirmed').length,
    readyToSchedule: sessions.filter((item) => item.status === 'ready_to_schedule' || item.status === 'awaiting_release_window').length,
    sessions,
  } satisfies AdminSchedulingSnapshot;
}

function getReadyStatusFromSession(session: LiveSessionBooking) {
  return isAfter(parseISO(session.earliestScheduleAt || nowIso()), new Date())
    ? 'awaiting_release_window'
    : 'ready_to_schedule';
}

async function getReservedSessionRanges(excludeUserId?: string) {
  const snapshot = await getAdminDb().collection(COLLECTION).get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as LiveSessionBooking) } as LiveSessionBooking))
    .filter((session) =>
      Boolean(session.requestedSlotStart && session.requestedSlotEnd) &&
      session.userId !== excludeUserId &&
      ['pending_confirmation', 'confirmed', 'completed'].includes(session.status)
    )
    .map((session) => ({
      start: session.requestedSlotStart!,
      end: session.requestedSlotEnd!,
      session,
    }));
}

async function getBookedSessionsForDate(dateKey: string, excludeSessionId?: string) {
  const snapshot = await getAdminDb().collection(COLLECTION).get();

  return snapshot.docs
    .map((doc) => ({ id: doc.id, ...(doc.data() as LiveSessionBooking) } as LiveSessionBooking))
    .filter((session) => {
      if (!session.requestedSlotStart || !session.requestedSlotEnd) return false;
      if (excludeSessionId && session.id === excludeSessionId) return false;
      if (!['pending_confirmation', 'confirmed', 'completed'].includes(session.status)) return false;

      const sessionDateKey = formatInTimeZone(session.requestedSlotStart, getSchedulingTimezone(), 'yyyy-MM-dd');
      return sessionDateKey === dateKey;
    });
}

export async function getSchedulingDayOverview(sessionId: string): Promise<SchedulingDayOverview> {
  const snapshot = await getAdminDb().collection(COLLECTION).doc(sessionId).get();
  if (!snapshot.exists) {
    throw new Error('SESSION_NOT_FOUND');
  }

  const session = { id: snapshot.id, ...(snapshot.data() as LiveSessionBooking) } as LiveSessionBooking;
  if (!session.requestedSlotStart) {
    throw new Error('SESSION_WITHOUT_SLOT');
  }

  const timezone = getSchedulingTimezone();
  const dateKey = formatInTimeZone(session.requestedSlotStart, timezone, 'yyyy-MM-dd');
  const [events, bookedSessions] = await Promise.all([
    listCalendarEventsForDate(dateKey),
    getBookedSessionsForDate(dateKey, session.id),
  ]);

  return {
    dateKey,
    timezone,
    session,
    events: [
      ...bookedSessions.map((bookedSession) => ({
        id: bookedSession.id,
        title: `[APP] ${bookedSession.studentName || 'Aluno'} • ${bookedSession.status === 'confirmed' ? 'confirmado' : 'pendente'}`,
        start: bookedSession.requestedSlotStart || null,
        end: bookedSession.requestedSlotEnd || null,
        status: bookedSession.status,
        htmlLink: bookedSession.calendarHtmlLink || null,
        isCurrentRequest: false,
      })),
      ...events.map((event) => ({
        ...event,
        isCurrentRequest: Boolean(session.calendarEventId && event.id === session.calendarEventId),
      })),
      {
        id: session.id,
        title: `[PEDIDO ATUAL] ${session.studentName || 'Aluno'}`,
        start: session.requestedSlotStart || null,
        end: session.requestedSlotEnd || null,
        status: session.status,
        htmlLink: session.calendarHtmlLink || null,
        isCurrentRequest: true,
      },
    ].sort((a, b) => new Date(a.start || 0).getTime() - new Date(b.start || 0).getTime()),
  };
}

export async function updateSchedulingStatusByAdmin(options: {
  sessionId: string;
  decision: 'confirm' | 'pending' | 'reject';
  reason?: string;
}) {
  const snapshot = await getAdminDb().collection(COLLECTION).doc(options.sessionId).get();
  if (!snapshot.exists) {
    throw new Error('SESSION_NOT_FOUND');
  }

  const session = { id: snapshot.id, ...(snapshot.data() as LiveSessionBooking) } as LiveSessionBooking;
  if (!session.requestedSlotStart || !session.requestedSlotEnd) {
    throw new Error('SESSION_WITHOUT_SLOT');
  }

  if (options.decision === 'confirm') {
    let calendarEventId = session.calendarEventId || null;
    let calendarHtmlLink = session.calendarHtmlLink || null;

    if (calendarEventId) {
      const updated = await updateCalendarEventMarker(calendarEventId, 'CONFIRMADO');
      calendarHtmlLink = updated?.htmlLink || calendarHtmlLink;
    } else if (session.requestedSlotStart && session.requestedSlotEnd) {
      const created = await createCalendarEventForBooking({
        ...session,
        status: 'confirmed',
      });
      calendarEventId = created?.eventId || null;
      calendarHtmlLink = created?.htmlLink || null;
    }

    const sessionRef = getAdminDb().collection(COLLECTION).doc(session.id!);
    const slotLockId = session.slotLockId || getSlotLockId(
      session.requestedSlotStart!,
      session.requestedSlotEnd!
    );
    const slotLockRef = getAdminDb().collection(SLOT_LOCKS_COLLECTION).doc(slotLockId);

    try {
      await getAdminDb().runTransaction(async (transaction) => {
        const [currentSnapshot, slotLockSnapshot] = await Promise.all([
          transaction.get(sessionRef),
          transaction.get(slotLockRef),
        ]);
        if (!currentSnapshot.exists) throw new Error('SESSION_NOT_FOUND');

        const current = {
          id: currentSnapshot.id,
          ...(currentSnapshot.data() as LiveSessionBooking),
        } as LiveSessionBooking;
        if (
          !['pending_confirmation', 'confirmed'].includes(current.status) ||
          current.requestedSlotStart !== session.requestedSlotStart ||
          current.requestedSlotEnd !== session.requestedSlotEnd
        ) {
          throw new Error('SESSION_STATE_CHANGED');
        }
        if (
          !slotLockSnapshot.exists ||
          slotLockSnapshot.data()?.sessionId !== current.id ||
          slotLockSnapshot.data()?.userId !== current.userId
        ) {
          throw new Error('SLOT_RESERVATION_MISSING');
        }

        transaction.set(sessionRef, stripUndefined({
          status: 'confirmed',
          slotLockId,
          calendarEventId,
          calendarHtmlLink,
          confirmedAt: current.confirmedAt || nowIso(),
          adminDecisionReason: null,
          updatedAt: nowIso(),
          lastActionMessage: 'Sua aula ao vivo foi confirmada. O Pilar 3 já está liberado para você continuar.',
        }), { merge: true });
      });
    } catch (error) {
      const errorCode = error instanceof Error ? error.message : '';
      if (
        calendarEventId &&
        (errorCode === 'SESSION_STATE_CHANGED' || errorCode === 'SLOT_RESERVATION_MISSING')
      ) {
        await cancelCalendarEvent(calendarEventId);
      }
      throw error;
    }

    return;
  }

  if (options.decision === 'pending') {
    if (session.calendarEventId) {
      await cancelCalendarEvent(session.calendarEventId);
    }

    const sessionRef = getAdminDb().collection(COLLECTION).doc(session.id!);
    const slotLockId = session.slotLockId || (
      session.requestedSlotStart && session.requestedSlotEnd
        ? getSlotLockId(session.requestedSlotStart, session.requestedSlotEnd)
        : null
    );
    await getAdminDb().runTransaction(async (transaction) => {
      const currentSnapshot = await transaction.get(sessionRef);
      if (!currentSnapshot.exists) throw new Error('SESSION_NOT_FOUND');
      const current = {
        id: currentSnapshot.id,
        ...(currentSnapshot.data() as LiveSessionBooking),
      } as LiveSessionBooking;
      if (
        current.status !== session.status ||
        current.requestedSlotStart !== session.requestedSlotStart ||
        current.requestedSlotEnd !== session.requestedSlotEnd
      ) {
        throw new Error('SESSION_STATE_CHANGED');
      }

      const slotLockRef = slotLockId
        ? getAdminDb().collection(SLOT_LOCKS_COLLECTION).doc(slotLockId)
        : null;
      const slotLockSnapshot = slotLockRef ? await transaction.get(slotLockRef) : null;
      if (
        slotLockRef &&
        (!slotLockSnapshot?.exists ||
          slotLockSnapshot.data()?.sessionId !== current.id ||
          slotLockSnapshot.data()?.userId !== current.userId)
      ) {
        throw new Error('SLOT_RESERVATION_MISSING');
      }

      const bookingRevision = Number(current.bookingRevision || 0) + 1;
      transaction.set(sessionRef, stripUndefined({
        status: 'pending_confirmation',
        slotLockId,
        bookingRevision,
        calendarEventId: null,
        calendarHtmlLink: null,
        confirmedAt: null,
        adminDecisionReason: null,
        updatedAt: nowIso(),
        lastActionMessage: 'Seu pedido segue pendente. A confirmação fica sob controle do admin no painel.',
      }), { merge: true });
      if (slotLockRef) {
        transaction.set(slotLockRef, { bookingRevision, updatedAt: nowIso() }, { merge: true });
      }
    });

    return;
  }

  const rejectionReason = options.reason?.trim() || 'O horário escolhido não pôde ser confirmado. Escolha um novo horário disponível.';

  if (session.calendarEventId) {
    await cancelCalendarEvent(session.calendarEventId);
  }

  const nextStatus = getReadyStatusFromSession(session);
  await updateSessionAndReleaseSlot({
    sessionId: session.id!,
    expectedStatuses: [session.status],
    expectedSlotStart: session.requestedSlotStart,
    update: {
      status: nextStatus,
      requestedSlotStart: null,
      requestedSlotEnd: null,
      calendarEventId: null,
      calendarHtmlLink: null,
      confirmedAt: null,
      adminDecisionReason: rejectionReason,
      cancelledAt: nowIso(),
      updatedAt: nowIso(),
      lastActionMessage: `Esse horário não foi aprovado. Motivo: ${rejectionReason}`,
    },
  });

}
