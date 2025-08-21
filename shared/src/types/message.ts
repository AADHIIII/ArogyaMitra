import { z } from 'zod';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  SYSTEM = 'SYSTEM'
}

export enum MessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ'
}

export const MessageSchema = z.object({
  id: z.string().uuid(),
  fromUserId: z.string().uuid(),
  toUserId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  type: z.nativeEnum(MessageType),
  content: z.string(),
  attachmentUrl: z.string().url().optional(),
  status: z.nativeEnum(MessageStatus),
  readAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ConversationSchema = z.object({
  id: z.string().uuid(),
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  lastMessageAt: z.date(),
  lastMessage: z.string().optional(),
  unreadCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Type exports
export type Message = z.infer<typeof MessageSchema>;
export type Conversation = z.infer<typeof ConversationSchema>;

// API Request schemas
export const SendMessageSchema = z.object({
  toUserId: z.string().uuid(),
  appointmentId: z.string().uuid().optional(),
  type: z.nativeEnum(MessageType).default(MessageType.TEXT),
  content: z.string().min(1),
  attachmentUrl: z.string().url().optional(),
});

export const MarkMessageReadSchema = z.object({
  messageId: z.string().uuid(),
});

export type SendMessageRequest = z.infer<typeof SendMessageSchema>;
export type MarkMessageReadRequest = z.infer<typeof MarkMessageReadSchema>;