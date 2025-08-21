import { z } from 'zod';

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  RESCHEDULED = 'RESCHEDULED'
}

export enum AppointmentType {
  IN_PERSON = 'IN_PERSON',
  TELEHEALTH = 'TELEHEALTH',
  FOLLOW_UP = 'FOLLOW_UP',
  CONSULTATION = 'CONSULTATION',
  EMERGENCY = 'EMERGENCY'
}

export const AppointmentSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.date(),
  duration: z.number().int().positive().default(30), // minutes
  type: z.nativeEnum(AppointmentType),
  status: z.nativeEnum(AppointmentStatus),
  reason: z.string(),
  notes: z.string().optional(),
  symptoms: z.string().optional(),
  diagnosis: z.string().optional(),
  prescription: z.string().optional(),
  followUpRequired: z.boolean().default(false),
  followUpDate: z.date().optional(),
  reminderSent: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DoctorAvailabilitySchema = z.object({
  id: z.string().uuid(),
  doctorId: z.string().uuid(),
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/), // HH:MM format
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  slotDuration: z.number().int().positive().default(30), // minutes
  bufferTime: z.number().int().min(0).default(5), // minutes between appointments
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const AppointmentSlotSchema = z.object({
  doctorId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isAvailable: z.boolean(),
  appointmentId: z.string().uuid().optional(),
});

// Type exports
export type Appointment = z.infer<typeof AppointmentSchema>;
export type DoctorAvailability = z.infer<typeof DoctorAvailabilitySchema>;
export type AppointmentSlot = z.infer<typeof AppointmentSlotSchema>;

// API Request schemas
export const CreateAppointmentSchema = AppointmentSchema.omit({
  id: true,
  status: true,
  reminderSent: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: z.nativeEnum(AppointmentStatus).optional().default(AppointmentStatus.SCHEDULED),
});

export const UpdateAppointmentSchema = CreateAppointmentSchema.partial();

export const BookAppointmentSchema = z.object({
  doctorId: z.string().uuid(),
  scheduledAt: z.date(),
  type: z.nativeEnum(AppointmentType),
  reason: z.string().min(1),
  symptoms: z.string().optional(),
});

export const RescheduleAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  newScheduledAt: z.date(),
  reason: z.string().optional(),
});

export type CreateAppointmentRequest = z.infer<typeof CreateAppointmentSchema>;
export type UpdateAppointmentRequest = z.infer<typeof UpdateAppointmentSchema>;
export type BookAppointmentRequest = z.infer<typeof BookAppointmentSchema>;
export type RescheduleAppointmentRequest = z.infer<typeof RescheduleAppointmentSchema>;