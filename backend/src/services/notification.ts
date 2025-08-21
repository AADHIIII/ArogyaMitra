import { PrismaClient, NotificationType, NotificationStatus } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const createNotificationSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  type: z.nativeEnum(NotificationType),
  title: z.string().min(1, 'Title is required'),
  message: z.string().min(1, 'Message is required'),
  data: z.record(z.any()).optional(),
  channels: z.array(z.enum(['email', 'sms', 'push', 'in-app'])).default(['in-app']),
  scheduledFor: z.string().optional(),
});

export const getNotificationsSchema = z.object({
  type: z.nativeEnum(NotificationType).optional(),
  status: z.nativeEnum(NotificationStatus).optional(),
  unreadOnly: z.boolean().default(false),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(10),
});

export const updateNotificationSchema = z.object({
  status: z.nativeEnum(NotificationStatus).optional(),
  readAt: z.string().optional(),
});

export type CreateNotificationData = z.infer<typeof createNotificationSchema>;
export type GetNotificationsData = z.infer<typeof getNotificationsSchema>;
export type UpdateNotificationData = z.infer<typeof updateNotificationSchema>;

export class NotificationService {
  // Create a new notification
  static async createNotification(data: CreateNotificationData) {
    const { scheduledFor, ...notificationData } = data;

    const notification = await prisma.notification.create({
      data: {
        ...notificationData,
        scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
        status: NotificationStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    // If not scheduled, send immediately
    if (!scheduledFor) {
      await this.sendNotification(notification.id);
    }

    return notification;
  }

  // Send notification through specified channels
  static async sendNotification(notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.status !== NotificationStatus.PENDING) {
      throw new Error('Notification has already been processed');
    }

    try {
      const results = [];

      // Send through each channel
      for (const channel of notification.channels) {
        switch (channel) {
          case 'email':
            if (notification.user.email) {
              const emailResult = await this.sendEmailNotification(notification);
              results.push({ channel: 'email', success: emailResult });
            }
            break;

          case 'sms':
            if (notification.user.phone) {
              const smsResult = await this.sendSMSNotification(notification);
              results.push({ channel: 'sms', success: smsResult });
            }
            break;

          case 'push':
            const pushResult = await this.sendPushNotification(notification);
            results.push({ channel: 'push', success: pushResult });
            break;

          case 'in-app':
            // In-app notifications are stored in database and shown in UI
            results.push({ channel: 'in-app', success: true });
            break;
        }
      }

      // Update notification status
      const allSuccessful = results.every(r => r.success);
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: allSuccessful ? NotificationStatus.SENT : NotificationStatus.FAILED,
          sentAt: new Date(),
        },
      });

      return { success: allSuccessful, results };

    } catch (error) {
      // Mark as failed
      await prisma.notification.update({
        where: { id: notificationId },
        data: {
          status: NotificationStatus.FAILED,
        },
      });

      throw error;
    }
  }

  // Send email notification (placeholder - integrate with your email service)
  static async sendEmailNotification(notification: any): Promise<boolean> {
    try {
      // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
      console.log(`📧 Email notification sent to ${notification.user.email}:`, {
        title: notification.title,
        message: notification.message,
      });
      
      return true;
    } catch (error) {
      console.error('Email notification failed:', error);
      return false;
    }
  }

  // Send SMS notification (placeholder - integrate with SMS service)
  static async sendSMSNotification(notification: any): Promise<boolean> {
    try {
      // TODO: Integrate with SMS service (Twilio, AWS SNS, etc.)
      console.log(`📱 SMS notification sent to ${notification.user.phone}:`, {
        message: `${notification.title}: ${notification.message}`,
      });
      
      return true;
    } catch (error) {
      console.error('SMS notification failed:', error);
      return false;
    }
  }

  // Send push notification (placeholder - integrate with push service)
  static async sendPushNotification(notification: any): Promise<boolean> {
    try {
      // TODO: Integrate with push service (Firebase, OneSignal, etc.)
      console.log(`🔔 Push notification sent to user ${notification.userId}:`, {
        title: notification.title,
        message: notification.message,
        data: notification.data,
      });
      
      return true;
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  }

  // Get notifications for a user
  static async getNotifications(userId: string, filters: GetNotificationsData) {
    const { type, status, unreadOnly, page, limit } = filters;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (unreadOnly) {
      where.readAt = null;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Mark notification as read
  static async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Access denied');
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return updatedNotification;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    return result;
  }

  // Get unread notification count
  static async getUnreadCount(userId: string) {
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        readAt: null,
      },
    });

    return { unreadCount };
  }

  // Delete notification
  static async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new Error('Access denied');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { success: true };
  }

  // Create appointment reminder notifications
  static async createAppointmentReminder(appointmentId: string, reminderType: 'confirmation' | 'reminder' | 'cancellation') {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        doctor: true,
        doctorProfile: true,
      },
    });

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    const appointmentDate = new Date(appointment.appointmentDate);
    const formattedDate = appointmentDate.toLocaleDateString();
    const formattedTime = appointment.startTime;

    let notificationData: CreateNotificationData;

    switch (reminderType) {
      case 'confirmation':
        notificationData = {
          userId: appointment.patientId,
          type: NotificationType.APPOINTMENT_CONFIRMED,
          title: 'Appointment Confirmed',
          message: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} on ${formattedDate} at ${formattedTime} has been confirmed.`,
          data: {
            appointmentId: appointment.id,
            doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
          },
          channels: ['in-app', 'email'],
        };
        break;

      case 'reminder':
        // Schedule reminder 24 hours before appointment
        const reminderTime = new Date(appointmentDate);
        reminderTime.setHours(reminderTime.getHours() - 24);

        notificationData = {
          userId: appointment.patientId,
          type: NotificationType.APPOINTMENT_REMINDER,
          title: 'Appointment Reminder',
          message: `Reminder: You have an appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} tomorrow at ${formattedTime}.`,
          data: {
            appointmentId: appointment.id,
            doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
          },
          channels: ['in-app', 'email', 'sms'],
          scheduledFor: reminderTime.toISOString(),
        };
        break;

      case 'cancellation':
        notificationData = {
          userId: appointment.patientId,
          type: NotificationType.APPOINTMENT_CANCELLED,
          title: 'Appointment Cancelled',
          message: `Your appointment with Dr. ${appointment.doctor.firstName} ${appointment.doctor.lastName} on ${formattedDate} at ${formattedTime} has been cancelled.`,
          data: {
            appointmentId: appointment.id,
            doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
            appointmentDate: formattedDate,
            appointmentTime: formattedTime,
          },
          channels: ['in-app', 'email'],
        };
        break;
    }

    return await this.createNotification(notificationData);
  }

  // Create medication reminder
  static async createMedicationReminder(medicationId: string, scheduledTime: Date) {
    const medication = await prisma.medication.findUnique({
      where: { id: medicationId },
      include: {
        prescription: {
          include: {
            patient: true,
          },
        },
      },
    });

    if (!medication) {
      throw new Error('Medication not found');
    }

    const notificationData: CreateNotificationData = {
      userId: medication.prescription.patientId,
      type: NotificationType.MEDICATION_REMINDER,
      title: 'Medication Reminder',
      message: `Time to take your medication: ${medication.name} (${medication.dosage})`,
      data: {
        medicationId: medication.id,
        medicationName: medication.name,
        dosage: medication.dosage,
        instructions: medication.instructions,
      },
      channels: ['in-app', 'push'],
      scheduledFor: scheduledTime.toISOString(),
    };

    return await this.createNotification(notificationData);
  }

  // Process scheduled notifications (to be called by a cron job)
  static async processScheduledNotifications() {
    const now = new Date();
    
    const scheduledNotifications = await prisma.notification.findMany({
      where: {
        status: NotificationStatus.PENDING,
        scheduledFor: {
          lte: now,
        },
      },
      take: 100, // Process in batches
    });

    const results = [];

    for (const notification of scheduledNotifications) {
      try {
        const result = await this.sendNotification(notification.id);
        results.push({ notificationId: notification.id, success: result.success });
      } catch (error) {
        console.error(`Failed to send scheduled notification ${notification.id}:`, error);
        results.push({ notificationId: notification.id, success: false, error: error.message });
      }
    }

    return results;
  }
}