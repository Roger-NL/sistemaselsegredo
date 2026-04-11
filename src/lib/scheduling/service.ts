import { adminDb } from '@/lib/firebase-admin';
import { addDays, isAfter, parseISO, subHours } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { cancelCalendarEvent, createCalendarEventForBooking, getAvailableSchedulingSlots, getCalendarEventState, getSchedulingTimezone, getSchedulingTutorEmail, isGoogleCalendarConfigured, listCalendarEventsForDate, updateCalendarEventMarker } from '@/lib/scheduling/google-calendar';
import type { AdminSchedulingSnapshot, LiveSessionAvailabilitySlot, LiveSessionBooking, LiveSessionStatusPayload, SchedulingDayOverview } from '@/lib/scheduling/types';

const COLLECTION = 'live_sessions';
const PURCHASE_WINDOW_DAYS = 7;
const RESCHEDULE_DEADLINE_HOURS = 24;

function stripUndefined<T extends object>(value: T): T {
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).filter(([, entryValue]) => entryValue !== undefined)
  ) as T;
}

function nowIso() {
  return new Date().toISOString();
}

function getSessionId(userId: string, sourcePillarId: number) {
  return `${userId}_p${sourcePillarId}`;
}

function getEarliestScheduleAt(premiumActivatedAt?: string) {
  if (!premiumActivatedAt) return nowIso();
  return addDays(parseISO(premiumActivatedAt), PURCHASE_WINDOW_DAYS).toISOString();
}

async function getUserProfile(userId: string) {
  const snapshot = await adminDb.collection('users').doc(userId).get();
  if (!snapshot.exists) return null;
  return snapshot.data() as Record<string, unknown>;
}

export async function getLiveSessionByUserAndPillar(userId: string, sourcePillarId: number) {
  const snapshot = await adminDb.collection(COLLECTION).doc(getSessionId(userId, sourcePillarId)).get();
  if (!snapshot.exists) return null;
  return { id: snapshot.id, ...(snapshot.data() as LiveSessionBooking) } as LiveSessionBooking;
}

export async function releaseLiveSessionAfterApproval(options: {
  userId: string;
  sourcePillarId: number;
  examId: string;
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
  const sessionId = getSessionId(options.userId, options.sourcePillarId);
  const current = await getLiveSessionByUserAndPillar(options.userId, options.sourcePillarId);
  const currentStatus = current?.status;
  const nextStatus = currentStatus === 'confirmed' || currentStatus === 'completed'
    ? currentStatus
    : isAfter(parseISO(earliestScheduleAt), new Date())
      ? 'awaiting_release_window'
      : 'ready_to_schedule';

  const session: LiveSessionBooking = {
    id: sessionId,
    userId: options.userId,
    sourcePillarId: options.sourcePillarId,
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

  await adminDb.collection(COLLECTION).doc(sessionId).set(stripUndefined(session), { merge: true });
  return session;
}

async function syncSessionWithCalendar(session: LiveSessionBooking) {
  if (!session.calendarEventId) return session;

  const calendarState = await getCalendarEventState(session.calendarEventId);
  if (!calendarState) return session;

  let nextStatus = session.status;
  let nextMessage = session.lastActionMessage;
  let shouldUnlockPillarThree = false;
  const normalizedSummary = calendarState.summary?.toUpperCase() || '';
  const confirmedByMarker = normalizedSummary.includes('[CONFIRMADO]') || normalizedSummary.includes('[OK]');
  const rejectedByMarker = normalizedSummary.includes('[RECUSAR]') || normalizedSummary.includes('[CANCELAR]');

  if (calendarState.status === 'cancelled' || rejectedByMarker) {
    nextStatus = 'ready_to_schedule';
    nextMessage = 'Esse horário não foi confirmado. Escolha outro horário para continuar.';
  } else if (confirmedByMarker) {
    nextStatus = 'confirmed';
    nextMessage = 'Sua aula ao vivo foi confirmada. O Pilar 3 já está liberado para você continuar.';
    shouldUnlockPillarThree = session.sourcePillarId === 2;
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

    await adminDb.collection(COLLECTION).doc(session.id!).set(stripUndefined(updatedSession), { merge: true });

    if (shouldUnlockPillarThree) {
      const userRef = adminDb.collection('users').doc(session.userId);
      const userDoc = await userRef.get();
      const approvedPillar = userDoc.exists ? Number(userDoc.data()?.approvedPillar || 1) : 1;
      await userRef.set({ approvedPillar: Math.max(approvedPillar, 3), updatedAt: nowIso() }, { merge: true });
    }

    return {
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

  let session = await getLiveSessionByUserAndPillar(userId, 2);

  if (!session) {
    const pillarTwoExamQuery = await adminDb.collection('pillar_exams')
      .where('userId', '==', userId)
      .where('pillarId', '==', 2)
      .where('status', '==', 'approved')
      .limit(1)
      .get();

    if (!pillarTwoExamQuery.empty) {
      session = await releaseLiveSessionAfterApproval({
        userId,
        sourcePillarId: 2,
        examId: pillarTwoExamQuery.docs[0].id,
      });
    }
  }

  if (session) {
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

      await adminDb.collection(COLLECTION).doc(session.id!).set(promoted, { merge: true });
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
    ? 'Sua área de agendamentos já existe, mas a primeira aula ao vivo só libera depois da aprovação do Pilar 2.'
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
  if (!status.session || !status.canRequestScheduling) {
    throw new Error('SESSION_NOT_READY');
  }

  const bookingStart = parseISO(options.slotStart);
  if (isAfter(parseISO(status.earliestScheduleAt || nowIso()), bookingStart)) {
    throw new Error('SLOT_NOT_ALLOWED_YET');
  }

  const availableSlots = await getSchedulingAvailability(options.userId);
  const requestedSlotStillAvailable = availableSlots.some(
    (slot) => slot.start === options.slotStart && slot.end === options.slotEnd
  );

  if (!requestedSlotStillAvailable) {
    throw new Error('SLOT_NO_LONGER_AVAILABLE');
  }

  const sessionId = status.session.id || getSessionId(options.userId, 2);
  const nextSession: LiveSessionBooking = {
    ...status.session,
    id: sessionId,
    status: 'pending_confirmation',
    requestedSlotStart: options.slotStart,
    requestedSlotEnd: options.slotEnd,
    notes: options.notes,
    updatedAt: nowIso(),
    lastActionMessage: 'Seu pedido foi enviado. Agora o tutor confirma esse horário no painel.',
    tutorEmail: status.session.tutorEmail || getSchedulingTutorEmail(),
  };

  await adminDb.collection(COLLECTION).doc(sessionId).set(stripUndefined({
    ...nextSession,
    calendarEventId: null,
    calendarHtmlLink: null,
  }), { merge: true });

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

  await adminDb.collection(COLLECTION).doc(status.session.id!).set(stripUndefined({
    status: nextStatus,
    requestedSlotStart: null,
    requestedSlotEnd: null,
    calendarEventId: null,
    calendarHtmlLink: null,
    cancelledAt: nowIso(),
    updatedAt: nowIso(),
    lastActionMessage: 'Seu pedido foi cancelado. Quando quiser, escolha um novo horário válido.',
  }), { merge: true });
}

export async function getAdminSchedulingSnapshot() {
  const snapshot = await adminDb.collection(COLLECTION).get();
  const sessions = snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as LiveSessionBooking) }));

  return {
    total: sessions.length,
    pendingConfirmation: sessions.filter((item) => item.status === 'pending_confirmation').length,
    confirmed: sessions.filter((item) => item.status === 'confirmed').length,
    readyToSchedule: sessions.filter((item) => item.status === 'ready_to_schedule' || item.status === 'awaiting_release_window').length,
    sessions,
  } satisfies AdminSchedulingSnapshot;
}

async function unlockPillarForConfirmedSession(session: LiveSessionBooking) {
  if (session.sourcePillarId !== 2) return;

  const userRef = adminDb.collection('users').doc(session.userId);
  const userDoc = await userRef.get();
  const approvedPillar = userDoc.exists ? Number(userDoc.data()?.approvedPillar || 1) : 1;
  await userRef.set({ approvedPillar: Math.max(approvedPillar, 3), updatedAt: nowIso() }, { merge: true });
}

function getReadyStatusFromSession(session: LiveSessionBooking) {
  return isAfter(parseISO(session.earliestScheduleAt || nowIso()), new Date())
    ? 'awaiting_release_window'
    : 'ready_to_schedule';
}

async function getReservedSessionRanges(excludeUserId?: string) {
  const snapshot = await adminDb.collection(COLLECTION).get();

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
  const snapshot = await adminDb.collection(COLLECTION).get();

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
  const snapshot = await adminDb.collection(COLLECTION).doc(sessionId).get();
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
}) {
  const snapshot = await adminDb.collection(COLLECTION).doc(options.sessionId).get();
  if (!snapshot.exists) {
    throw new Error('SESSION_NOT_FOUND');
  }

  const session = { id: snapshot.id, ...(snapshot.data() as LiveSessionBooking) } as LiveSessionBooking;
  if (!session.requestedSlotStart && options.decision !== 'pending') {
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

    await adminDb.collection(COLLECTION).doc(session.id!).set(stripUndefined({
      status: 'confirmed',
      calendarEventId,
      calendarHtmlLink,
      confirmedAt: session.confirmedAt || nowIso(),
      updatedAt: nowIso(),
      lastActionMessage: 'Sua aula ao vivo foi confirmada. O Pilar 3 já está liberado para você continuar.',
    }), { merge: true });

    await unlockPillarForConfirmedSession(session);
    return;
  }

  if (options.decision === 'pending') {
    if (session.calendarEventId) {
      await cancelCalendarEvent(session.calendarEventId);
    }

    await adminDb.collection(COLLECTION).doc(session.id!).set(stripUndefined({
      status: 'pending_confirmation',
      calendarEventId: null,
      calendarHtmlLink: null,
      confirmedAt: null,
      updatedAt: nowIso(),
      lastActionMessage: 'Seu pedido segue pendente. A confirmação fica sob controle do admin no painel.',
    }), { merge: true });
    return;
  }

  if (session.calendarEventId) {
    await cancelCalendarEvent(session.calendarEventId);
  }

  await adminDb.collection(COLLECTION).doc(session.id!).set(stripUndefined({
    status: getReadyStatusFromSession(session),
    requestedSlotStart: null,
    requestedSlotEnd: null,
    calendarEventId: null,
    calendarHtmlLink: null,
    confirmedAt: null,
    cancelledAt: nowIso(),
    updatedAt: nowIso(),
    lastActionMessage: 'Esse horário não foi confirmado. O aluno já pode escolher um novo horário válido.',
  }), { merge: true });
}
