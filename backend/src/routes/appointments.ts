import { Router } from 'express';
import { AppointmentController } from '../controllers/appointments';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/doctors/:doctorProfileId/slots', AppointmentController.getAvailableSlots);

// Protected routes - All authenticated users
router.get('/my', authenticate, AppointmentController.getMyAppointments);
router.get('/stats', authenticate, AppointmentController.getAppointmentStats);
router.get('/:appointmentId', authenticate, AppointmentController.getAppointment);
router.put('/:appointmentId', authenticate, AppointmentController.updateAppointment);

// Patient-only routes
router.post('/book', authenticate, authorize(UserRole.PATIENT), AppointmentController.bookAppointment);
router.post('/:appointmentId/reschedule', authenticate, AppointmentController.rescheduleAppointment);
router.post('/:appointmentId/cancel', authenticate, AppointmentController.cancelAppointment);

// Doctor-only routes
router.get('/today/list', authenticate, authorize(UserRole.DOCTOR), AppointmentController.getTodayAppointments);
router.post('/:appointmentId/confirm', authenticate, authorize(UserRole.DOCTOR), AppointmentController.confirmAppointment);
router.post('/:appointmentId/complete', authenticate, authorize(UserRole.DOCTOR), AppointmentController.completeAppointment);

export default router;