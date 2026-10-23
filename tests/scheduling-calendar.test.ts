import { describe, expect, it } from 'vitest';
import { getDeterministicCalendarEventId } from '../src/server/integrations/google-calendar';
import type { LiveSessionBooking } from '../src/server/scheduling/types';

const booking: LiveSessionBooking = {
  id: 'user-1_p2',
  userId: 'user-1',
  sourcePillarId: 2,
  title: 'Primeira aula ao vivo',
  status: 'pending_confirmation',
  requestedSlotStart: '2026-08-10T12:00:00.000Z',
  requestedSlotEnd: '2026-08-10T12:50:00.000Z',
  bookingRevision: 1,
};

describe('getDeterministicCalendarEventId', () => {
  it('returns the same provider-safe ID for retries of one booking revision', () => {
    const first = getDeterministicCalendarEventId(booking);
    const retry = getDeterministicCalendarEventId({ ...booking });

    expect(retry).toBe(first);
    expect(first).toMatch(/^[0-9a-v]{5,1024}$/);
  });

  it('changes the ID when the booking revision changes', () => {
    expect(getDeterministicCalendarEventId({ ...booking, bookingRevision: 2 }))
      .not.toBe(getDeterministicCalendarEventId(booking));
  });
});
