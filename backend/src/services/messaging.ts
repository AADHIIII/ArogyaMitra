import { PrismaClient, MessageStatus, NotificationType, NotificationStatus } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schemas
export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID'),
  content: z.string().min(1, 'Message content is required'),
  messageType: z.string().default('text'),
  attachments: z.array(z.string().url()).optional().default([]),
  replyToId: z.string().uuid().optional(),
});

export const getMessagesSchema = z.object({
  otherUserId: z.string().uuid('Invalid user ID').optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(50).default(20),
});

export const markAsReadSchema = z.object({
  messageIds: z.array(z.string().uuid()),
});

export type SendMessageData = z.infer<typeof sendMessageSchema>;
export type GetMessagesData = z.infer<typeof getMessagesSchema>;
export type MarkAsReadData = z.infer<typeof markAsReadSchema>;

export class MessagingService {
  // Send a new message
  static async sendMessage(senderId: string, data: SendMessageData) {
    const { receiverId, content, messageType, attachments, replyToId } = data;

    // Verify that sender and receiver exist and can communicate
    const [sender, receiver] = await Promise.all([
      prisma.user.findUnique({ where: { id: senderId } }),
      prisma.user.findUnique({ where: { id: receiverId } }),
    ]);

    if (!sender || !receiver) {
      throw new Error('Sender or receiver not found');
    }

    // Check if users can communicate (patients can only message their doctors and vice versa)
    const canCommunicate = await this.canUsersCommunicate(senderId, receiverId);
    if (!canCommunicate) {
      throw new Error('You can only message doctors you have appointments with');
    }

    // Verify reply-to message if provided
    if (replyToId) {
      const replyToMessage = await prisma.message.findUnique({
        where: { id: replyToId },
      });

      if (!replyToMessage || 
          (replyToMessage.senderId !== senderId && replyToMessage.receiverId !== senderId)) {
        throw new Error('Invalid reply-to message');
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        messageType,
        attachments,
        replyToId,
        status: MessageStatus.SENT,
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            profileImage: true,
          },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    // Create notification for receiver
    await this.createMessageNotification(receiverId, message);

    return message;
  }

  // Check if two users can communicate
  static async canUsersCommunicate(userId1: string, userId2: string): Promise<boolean> {
    // Admin can communicate with anyone
    const users = await prisma.user.findMany({
      where: { id: { in: [userId1, userId2] } },
      select: { id: true, role: true },
    });

    const user1 = users.find(u => u.id === userId1);
    const user2 = users.find(u => u.id === userId2);

    if (!user1 || !user2) return false;

    // Admin can communicate with anyone
    if (user1.role === 'ADMIN' || user2.role === 'ADMIN') {
      return true;
    }

    // Doctors and patients can communicate if they have appointments together
    if ((user1.role === 'DOCTOR' && user2.role === 'PATIENT') ||
        (user1.role === 'PATIENT' && user2.role === 'DOCTOR')) {
      
      const appointment = await prisma.appointment.findFirst({
        where: {
          OR: [
            { patientId: user1.role === 'PATIENT' ? userId1 : userId2,
              doctorId: user1.role === 'DOCTOR' ? userId1 : userId2 },
          ],
        },
      });

      return !!appointment;
    }

    // Same role users cannot communicate (except admin)
    return false;
  }

  // Get conversations for a user
  static async getConversations(userId: string) {
    // Get all users this user has messaged with
    const conversations = await prisma.$queryRaw`
      SELECT DISTINCT
        CASE 
          WHEN m.sender_id = ${userId} THEN m.receiver_id
          ELSE m.sender_id
        END as other_user_id,
        u.first_name,
        u.last_name,
        u.role,
        u.profile_image,
        (
          SELECT content 
          FROM messages 
          WHERE (sender_id = ${userId} AND receiver_id = other_user_id) 
             OR (sender_id = other_user_id AND receiver_id = ${userId})
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages 
          WHERE (sender_id = ${userId} AND receiver_id = other_user_id) 
             OR (sender_id = other_user_id AND receiver_id = ${userId})
          ORDER BY created_at DESC 
          LIMIT 1
        ) as last_message_at,
        (
          SELECT COUNT(*) 
          FROM messages 
          WHERE sender_id = other_user_id 
            AND receiver_id = ${userId} 
            AND status != 'READ'
        ) as unread_count
      FROM messages m
      JOIN users u ON u.id = CASE 
        WHEN m.sender_id = ${userId} THEN m.receiver_id
        ELSE m.sender_id
      END
      WHERE m.sender_id = ${userId} OR m.receiver_id = ${userId}
      ORDER BY last_message_at DESC
    ` as any[];

    return conversations;
  }

  // Get messages between two users
  static async getMessages(userId: string, filters: GetMessagesData) {
    const { otherUserId, page, limit } = filters;
    const skip = (page - 1) * limit;

    if (!otherUserId) {
      throw new Error('Other user ID is required');
    }

    // Verify users can communicate
    const canCommunicate = await this.canUsersCommunicate(userId, otherUserId);
    if (!canCommunicate) {
      throw new Error('You cannot view messages with this user');
    }

    const where = {
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    };

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        skip,
        take: limit,
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              role: true,
              profileImage: true,
            },
          },
          replyTo: {
            select: {
              id: true,
              content: true,
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.message.count({ where }),
    ]);

    return {
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Mark messages as read
  static async markMessagesAsRead(userId: string, data: MarkAsReadData) {
    const { messageIds } = data;

    // Only mark messages where the user is the receiver
    const updatedMessages = await prisma.message.updateMany({
      where: {
        id: { in: messageIds },
        receiverId: userId,
        status: { not: MessageStatus.READ },
      },
      data: {
        status: MessageStatus.READ,
        readAt: new Date(),
      },
    });

    return updatedMessages;
  }

  // Get unread message count
  static async getUnreadCount(userId: string) {
    const unreadCount = await prisma.message.count({
      where: {
        receiverId: userId,
        status: { not: MessageStatus.READ },
      },
    });

    return { unreadCount };
  }

  // Create message notification
  static async createMessageNotification(receiverId: string, message: any) {
    await prisma.notification.create({
      data: {
        userId: receiverId,
        type: NotificationType.MESSAGE_RECEIVED,
        title: 'New Message',
        message: `You have a new message from ${message.sender.firstName} ${message.sender.lastName}`,
        data: {
          messageId: message.id,
          senderId: message.senderId,
          senderName: `${message.sender.firstName} ${message.sender.lastName}`,
        },
        channels: ['in-app', 'email'],
        status: NotificationStatus.PENDING,
      },
    });
  }

  // Search messages
  static async searchMessages(userId: string, query: string, otherUserId?: string) {
    const where: any = {
      content: {
        contains: query,
        mode: 'insensitive',
      },
      OR: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    if (otherUserId) {
      where.OR = [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ];
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return messages;
  }

  // Delete message (soft delete by marking as deleted)
  static async deleteMessage(userId: string, messageId: string) {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Only sender can delete their own messages
    if (message.senderId !== userId) {
      throw new Error('You can only delete your own messages');
    }

    // Update message content to indicate deletion
    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content: '[Message deleted]',
        messageType: 'deleted',
        attachments: [],
      },
    });

    return deletedMessage;
  }
}