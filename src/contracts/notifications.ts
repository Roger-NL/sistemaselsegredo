export type OperationalNotificationKind = "new_signup" | "conversation_completed" | "study_completed" | "live_class_requested" | "student_message";
export type OperationalNotificationStatus = "pending" | "processing" | "sent" | "failed" | "needs_review";

export type OperationalNotificationSummary = {
  id: string;
  kind: OperationalNotificationKind;
  status: OperationalNotificationStatus;
  studentName: string;
  createdAt: string;
  sentAt: string | null;
  attempts: number;
  errorCode: string | null;
};

export type NotificationSettings = {
  recipientEmail: string;
  enabled: boolean;
  configured: boolean;
  senderEmail: string | null;
  cronConfigured: boolean;
  updatedAt: string | null;
  queuedCount: number;
  attentionCount: number;
  recent: OperationalNotificationSummary[];
};
