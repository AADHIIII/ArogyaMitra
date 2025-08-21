// User types
export * from './types/user';

// Appointment types
export * from './types/appointment';

// Prescription types
export * from './types/prescription';

// Message types
export * from './types/message';

// Notification types
export * from './types/notification';

// Utility types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

// Common constants
export const API_ROUTES = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    VERIFY: '/auth/verify',
  },
  
  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
  },
  
  // Appointments
  APPOINTMENTS: {
    BASE: '/appointments',
    BOOK: '/appointments/book',
    RESCHEDULE: '/appointments/reschedule',
    CANCEL: '/appointments/cancel',
    SLOTS: '/appointments/slots',
  },
  
  // Doctors
  DOCTORS: {
    BASE: '/doctors',
    SEARCH: '/doctors/search',
    AVAILABILITY: '/doctors/availability',
  },
  
  // Prescriptions
  PRESCRIPTIONS: {
    BASE: '/prescriptions',
    CONFIRM_INTAKE: '/prescriptions/confirm-intake',
    SKIP_INTAKE: '/prescriptions/skip-intake',
  },
  
  // Messages
  MESSAGES: {
    BASE: '/messages',
    CONVERSATIONS: '/messages/conversations',
    SEND: '/messages/send',
    MARK_READ: '/messages/mark-read',
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    PREFERENCES: '/notifications/preferences',
    MARK_READ: '/notifications/mark-read',
  },
} as const;