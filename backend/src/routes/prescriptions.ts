import { Router } from 'express';
import { PrescriptionController } from '../controllers/prescriptions';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '@prisma/client';

const router = Router();

// Protected routes - All authenticated users
router.get('/my', authenticate, PrescriptionController.getMyPrescriptions);
router.get('/stats', authenticate, PrescriptionController.getPrescriptionStats);
router.get('/:prescriptionId', authenticate, PrescriptionController.getPrescription);

// Doctor-only routes
router.post('/', authenticate, authorize(UserRole.DOCTOR), PrescriptionController.createPrescription);
router.put('/:prescriptionId', authenticate, authorize(UserRole.DOCTOR), PrescriptionController.updatePrescription);
router.post('/:prescriptionId/complete', authenticate, authorize(UserRole.DOCTOR), PrescriptionController.completePrescription);
router.post('/:prescriptionId/cancel', authenticate, authorize(UserRole.DOCTOR), PrescriptionController.cancelPrescription);

// Patient-only routes
router.post('/medications/intake', authenticate, authorize(UserRole.PATIENT), PrescriptionController.recordMedicationIntake);
router.get('/medications/schedule', authenticate, authorize(UserRole.PATIENT), PrescriptionController.getMedicationSchedule);
router.get('/medications/adherence', authenticate, authorize(UserRole.PATIENT), PrescriptionController.getMedicationAdherence);
router.get('/medications/reminders', authenticate, authorize(UserRole.PATIENT), PrescriptionController.getUpcomingReminders);

export default router;