import { z } from 'zod';

export enum NotificationType {
  APPOINTMENT_REMINDER = 'APPOINTMENT_REMINDER',
  MEDICATION_REMINDER = 'MEDICATION_REMINDER',
  APPOINTMENT_CONFIRMED = 'APPOINTMENT_CONFIRMED',
  APPOINTMENT_CANCELLED = 'APPOINTMENT_CANCELLED',
  APPOINTMENT_RESCHEDULED = 'APPOINTMENT_RESCHEDULED',
  NEW_MESSAGE = 'NEW_MESSAGE',
  PRESCRIPTION_ADDED = 'PRESCRIPTION_ADDED',
  FOLLOW_UP_REQUIRED = 'FOLLOW_UP_REQUIRED',
  SYSTEM_ALERT = 'SYSTEM_ALERT'
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  IN_APP = 'IN_APP'
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ'
}

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  channel: z.nativeEnum(NotificationChannel),
  title: z.string(),
  message: z.string(),
  data: z.record(z.any()).optional(), // Additional data as JSON
  status: z.nativeEnum(NotificationStatus),
  scheduledAt: z.date(),
  sentAt: z.date().optional(),
  readAt: z.date().optional(),
  retryCount: z.number().int().min(0).default(0),
  maxRetries: z.number().int().min(0).default(3),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const NotificationPreferenceSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: z.nativeEnum(NotificationType),
  channels: z.array(z.nativeEnum(NotificationChannel)),
  isEnabled: z.boolean().default(true),
  reminderMinutes: z.number().int().min(0).optional(), // For reminders
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type Notification = z.infer<typeof NotificationSchema>;
export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;

// API Request schemas
export const CreateNotificationSchema = NotificationSchema.omit({
  id: true,
  status: true,
  sentAt: true,
  readAt: true,
  retryCount: true,
  createdAt: true,
  updatedAt: true,
});

export const UpdateNotificationPreferenceSchema = z.object({
  type: z.nativeEnum(NotificationType),
  channels: z.array(z.nativeEnum(NotificationChannel)),
  isEnabled: z.boolean(),
  reminderMinutes: z.number().int().min(0).optional(),
});

export const MarkNotificationReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export type CreateNotificationRequest = z.infer<typeof CreateNotificationSchema>;
export type UpdateNotificationPreferenceRequest = z.infer<typeof UpdateNotificationPreferenceSchema>;
export type MarkNotificationReadRequest = z.infer<typeof MarkNotificationReadSchema>;