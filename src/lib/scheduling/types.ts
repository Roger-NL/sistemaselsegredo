export type LiveSessionStatus =
  | 'awaiting_pillar_approval'
  | 'awaiting_release_window'
  | 'ready_to_schedule'
  | 'pending_confirmation'
  | 'confirmed'
  | 'cancelled'
  | 'completed';

export interface LiveSessionBooking {
  id?: string;
  userId: string;
  sourcePillarId: number;
  examId?: string | null;
  title: string;
  status: LiveSessionStatus;
  studentName?: string | null;
  studentEmail?: string | null;
  studentPhone?: string | null;
  tutorEmail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  releasedAt?: string | null;
  earliestScheduleAt?: string | null;
  premiumActivatedAt?: string | null;
  calendarEventId?: string | null;
  calendarHtmlLink?: string | null;
  requestedSlotStart?: string | null;
  requestedSlotEnd?: string | null;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  completedAt?: string | null;
  lastActionMessage?: string | null;
  notes?: string | null;
}

export interface LiveSessionAvailabilitySlot {
  start: string;
  end: string;
  label: string;
  timezone: string;
}

export interface LiveSessionStatusPayload {
  isPremium: boolean;
  schedulingVisible: boolean;
  session: LiveSessionBooking | null;
  earliestScheduleAt: string | null;
  canRequestScheduling: boolean;
  canManageCurrentBooking: boolean;
  waitingReason?: string;
  timezone: string;
}

export interface AdminSchedulingSnapshot {
  total: number;
  pendingConfirmation: number;
  confirmed: number;
  readyToSchedule: number;
  sessions: LiveSessionBooking[];
}

export interface SchedulingCalendarDayItem {
  id?: string;
  title: string;
  start: string | null;
  end: string | null;
  status?: string | null;
  htmlLink?: string | null;
  isCurrentRequest?: boolean;
}

export interface SchedulingDayOverview {
  dateKey: string;
  timezone: string;
  session: LiveSessionBooking;
  events: SchedulingCalendarDayItem[];
}
