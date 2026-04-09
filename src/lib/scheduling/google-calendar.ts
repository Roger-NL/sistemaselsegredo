import { google } from 'googleapis';
import { addMinutes, eachDayOfInterval, format, isAfter, isBefore, parseISO, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import type { LiveSessionAvailabilitySlot, LiveSessionBooking } from '@/lib/scheduling/types';

const CALENDAR_SCOPE = ['https://www.googleapis.com/auth/calendar'];
const DEFAULT_TIMEZONE = process.env.GOOGLE_CALENDAR_TIMEZONE || 'America/Sao_Paulo';
const DEFAULT_CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || '';
const DEFAULT_TUTOR_EMAIL = process.env.GOOGLE_CALENDAR_TUTOR_EMAIL || '';
const SLOT_DURATION_MINUTES = Number(process.env.GOOGLE_CALENDAR_SLOT_DURATION_MINUTES || 50);
const SLOT_GAP_MINUTES = Number(process.env.GOOGLE_CALENDAR_SLOT_GAP_MINUTES || 10);
const WORKDAY_START_HOUR = Number(process.env.GOOGLE_CALENDAR_WORKDAY_START_HOUR || 9);
const WORKDAY_END_HOUR = Number(process.env.GOOGLE_CALENDAR_WORKDAY_END_HOUR || 18);
const WORKDAYS = (process.env.GOOGLE_CALENDAR_WORKDAYS || '1,2,3,4,5')
  .split(',')
  .map((value) => Number(value.trim()))
  .filter((value) => !Number.isNaN(value));

interface BusyRange {
  start: Date;
  end: Date;
}

function parseServiceAccount() {
  const raw = process.env.GOOGLE_CALENDAR_SERVICE_ACCOUNT;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (parsed.private_key) {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed;
  } catch (error) {
    console.error('[scheduling] Falha ao parsear GOOGLE_CALENDAR_SERVICE_ACCOUNT', error);
    return null;
  }
}

function getCalendarClient() {
  const serviceAccount = parseServiceAccount();
  if (!serviceAccount || !DEFAULT_CALENDAR_ID) return null;

  const auth = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: CALENDAR_SCOPE,
  });

  return google.calendar({ version: 'v3', auth });
}

export function getSchedulingTimezone() {
  return DEFAULT_TIMEZONE;
}

export function getSchedulingTutorEmail() {
  return DEFAULT_TUTOR_EMAIL || undefined;
}

export function isGoogleCalendarConfigured() {
  return Boolean(parseServiceAccount() && DEFAULT_CALENDAR_ID);
}

function intersects(rangeA: BusyRange, rangeB: BusyRange) {
  return rangeA.start < rangeB.end && rangeA.end > rangeB.start;
}

async function listBusyRanges(timeMin: string, timeMax: string): Promise<BusyRange[]> {
  const calendar = getCalendarClient();
  if (!calendar) return [];

  const response = await calendar.events.list({
    calendarId: DEFAULT_CALENDAR_ID,
    singleEvents: true,
    orderBy: 'startTime',
    timeMin,
    timeMax,
    maxResults: 250,
  });

  return (response.data.items || [])
    .map((item) => {
      const startValue = item.start?.dateTime || item.start?.date;
      const endValue = item.end?.dateTime || item.end?.date;
      if (!startValue || !endValue) return null;
      return {
        start: new Date(startValue),
        end: new Date(endValue),
      } as BusyRange;
    })
    .filter((item): item is BusyRange => Boolean(item));
}

function makeZonedDate(day: Date, hour: number, minute: number) {
  const zoned = toZonedTime(day, DEFAULT_TIMEZONE);
  const localDate = format(zoned, 'yyyy-MM-dd');
  return fromZonedTime(`${localDate}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`, DEFAULT_TIMEZONE);
}

export async function getAvailableSchedulingSlots(options: {
  earliestScheduleAt: string;
  daysAhead?: number;
}): Promise<LiveSessionAvailabilitySlot[]> {
  const daysAhead = options.daysAhead ?? 21;
  const now = new Date();
  const notBefore = isAfter(parseISO(options.earliestScheduleAt), now) ? parseISO(options.earliestScheduleAt) : now;
  const rangeStart = startOfDay(notBefore);
  const rangeEnd = addMinutes(rangeStart, daysAhead * 24 * 60);

  const busyRanges = await listBusyRanges(rangeStart.toISOString(), rangeEnd.toISOString());
  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });
  const slots: LiveSessionAvailabilitySlot[] = [];

  for (const day of days) {
    const zonedDay = toZonedTime(day, DEFAULT_TIMEZONE);
    const weekday = zonedDay.getDay();
    if (!WORKDAYS.includes(weekday)) continue;

    let cursor = makeZonedDate(day, WORKDAY_START_HOUR, 0);
    const workdayEnd = makeZonedDate(day, WORKDAY_END_HOUR, 0);

    while (isBefore(addMinutes(cursor, SLOT_DURATION_MINUTES), addMinutes(workdayEnd, 1))) {
      const slotEnd = addMinutes(cursor, SLOT_DURATION_MINUTES);
      const slotRange = { start: cursor, end: slotEnd };
      const slotStartsInFuture = !isBefore(cursor, notBefore);
      const isBusy = busyRanges.some((busy) => intersects(slotRange, busy));

      if (slotStartsInFuture && !isBusy) {
        const displayDate = toZonedTime(cursor, DEFAULT_TIMEZONE);
        slots.push({
          start: cursor.toISOString(),
          end: slotEnd.toISOString(),
          timezone: DEFAULT_TIMEZONE,
          label: format(displayDate, "EEE, dd/MM 'às' HH:mm"),
        });
      }

      cursor = addMinutes(slotEnd, SLOT_GAP_MINUTES);
    }
  }

  return slots.slice(0, 60);
}

export async function createCalendarEventForBooking(booking: LiveSessionBooking) {
  const calendar = getCalendarClient();
  if (!calendar || !booking.requestedSlotStart || !booking.requestedSlotEnd) {
    return null;
  }

  const attendees = [booking.studentEmail, booking.tutorEmail || DEFAULT_TUTOR_EMAIL]
    .filter((email): email is string => Boolean(email))
    .map((email) => ({ email }));

  const response = await calendar.events.insert({
    calendarId: DEFAULT_CALENDAR_ID,
    sendUpdates: attendees.length ? 'all' : 'none',
    requestBody: {
      summary: `Sessão ao vivo • ${booking.studentName || 'Aluno'} • Pilar ${booking.sourcePillarId}`,
      description: [
        `Aluno: ${booking.studentName || '-'}`,
        `Email: ${booking.studentEmail || '-'}`,
        `Telefone: ${booking.studentPhone || '-'}`,
        `Pilar de origem: ${booking.sourcePillarId}`,
        `Booking ID: ${booking.id || '-'}`,
        '',
        'Status inicial: pendente de confirmação do tutor.',
      ].join('\n'),
      start: {
        dateTime: booking.requestedSlotStart,
        timeZone: DEFAULT_TIMEZONE,
      },
      end: {
        dateTime: booking.requestedSlotEnd,
        timeZone: DEFAULT_TIMEZONE,
      },
      attendees,
      reminders: {
        useDefault: true,
      },
    },
  });

  return {
    eventId: response.data.id || undefined,
    htmlLink: response.data.htmlLink || undefined,
  };
}

export async function getCalendarEventState(eventId: string) {
  const calendar = getCalendarClient();
  if (!calendar) return null;

  try {
    const response = await calendar.events.get({
      calendarId: DEFAULT_CALENDAR_ID,
      eventId,
    });

    const event = response.data;
    const tutorEmail = DEFAULT_TUTOR_EMAIL;
    const tutorAttendee = tutorEmail
      ? event.attendees?.find((attendee) => attendee.email?.toLowerCase() === tutorEmail.toLowerCase())
      : undefined;

    return {
      status: event.status,
      htmlLink: event.htmlLink || undefined,
      tutorResponse: tutorAttendee?.responseStatus,
    };
  } catch (error) {
    console.error('[scheduling] Falha ao consultar evento no Google Calendar', error);
    return null;
  }
}

export async function cancelCalendarEvent(eventId: string) {
  const calendar = getCalendarClient();
  if (!calendar) return;

  try {
    await calendar.events.delete({
      calendarId: DEFAULT_CALENDAR_ID,
      eventId,
      sendUpdates: 'all',
    });
  } catch (error) {
    console.error('[scheduling] Falha ao cancelar evento no Google Calendar', error);
  }
}
