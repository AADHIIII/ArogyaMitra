import { Router } from 'express';
import { DoctorController } from '../controllers/doctors';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Public routes
router.get('/search', DoctorController.searchDoctors);
router.get('/specialties', DoctorController.getSpecialties);
router.get('/:doctorId', DoctorController.getProfile);
router.get('/:doctorId/slots', DoctorController.getAvailableSlots);

// Protected routes - Doctor only
router.post('/profile', authenticate, authorize(UserRole.DOCTOR), DoctorController.createProfile);
router.get('/profile/me', authenticate, authorize(UserRole.DOCTOR), DoctorController.getMyProfile);
router.put('/profile', authenticate, authorize(UserRole.DOCTOR), DoctorController.updateProfile);
router.post('/availability', authenticate, authorize(UserRole.DOCTOR), DoctorController.setAvailability);
router.get('/availability/me', authenticate, authorize(UserRole.DOCTOR), DoctorController.getAvailability);

// Admin routes
router.post('/specialties', authenticate, authorize(UserRole.ADMIN), DoctorController.createSpecialty);

export default router;