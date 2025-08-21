import { PrismaClient, UserRole, UserStatus, Gender, AppointmentStatus, AppointmentType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@arogyamitra.com' },
    update: {},
    create: {
      email: 'admin@arogyamitra.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Admin user created');

  // Create sample patients
  const patient1 = await prisma.user.upsert({
    where: { email: 'patient1@example.com' },
    update: {},
    create: {
      email: 'patient1@example.com',
      phone: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
      passwordHash: hashedPassword,
      patientProfile: {
        create: {
          dateOfBirth: new Date('1990-05-15'),
          gender: Gender.MALE,
          address: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          emergencyContact: '+1234567891',
          insuranceProvider: 'Blue Cross Blue Shield',
          insuranceNumber: 'BC123456789',
          medicalHistory: 'No significant medical history',
          allergies: 'None known',
          currentMedications: 'None',
        },
      },
    },
  });

  const patient2 = await prisma.user.upsert({
    where: { email: 'patient2@example.com' },
    update: {},
    create: {
      email: 'patient2@example.com',
      phone: '+1234567892',
      firstName: 'Jane',
      lastName: 'Smith',
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
      passwordHash: hashedPassword,
      patientProfile: {
        create: {
          dateOfBirth: new Date('1985-08-22'),
          gender: Gender.FEMALE,
          address: '456 Oak Ave',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90210',
          emergencyContact: '+1234567893',
          insuranceProvider: 'Aetna',
          insuranceNumber: 'AE987654321',
          medicalHistory: 'Hypertension, managed with medication',
          allergies: 'Penicillin',
          currentMedications: 'Lisinopril 10mg daily',
        },
      },
    },
  });

  console.log('✅ Sample patients created');

  // Create sample doctors
  const doctor1 = await prisma.user.upsert({
    where: { email: 'dr.wilson@hospital.com' },
    update: {},
    create: {
      email: 'dr.wilson@hospital.com',
      phone: '+1234567894',
      firstName: 'Sarah',
      lastName: 'Wilson',
      role: UserRole.DOCTOR,
      status: UserStatus.ACTIVE,
      passwordHash: hashedPassword,
      doctorProfile: {
        create: {
          licenseNumber: 'MD123456',
          specialty: 'Internal Medicine',
          subSpecialty: 'Cardiology',
          yearsOfExperience: 15,
          education: 'MD from Harvard Medical School, Residency at Johns Hopkins',
          hospitalAffiliation: 'City General Hospital',
          consultationFee: 200.00,
          bio: 'Dr. Wilson is a board-certified cardiologist with over 15 years of experience in treating heart conditions.',
          languages: ['English', 'Spanish'],
          rating: 4.8,
          totalReviews: 127,
          isVerified: true,
          acceptsInsurance: true,
        },
      },
    },
  });

  const doctor2 = await prisma.user.upsert({
    where: { email: 'dr.patel@clinic.com' },
    update: {},
    create: {
      email: 'dr.patel@clinic.com',
      phone: '+1234567895',
      firstName: 'Raj',
      lastName: 'Patel',
      role: UserRole.DOCTOR,
      status: UserStatus.ACTIVE,
      passwordHash: hashedPassword,
      doctorProfile: {
        create: {
          licenseNumber: 'MD789012',
          specialty: 'Family Medicine',
          yearsOfExperience: 8,
          education: 'MD from UCLA, Residency at Cedar Sinai',
          hospitalAffiliation: 'Community Health Center',
          consultationFee: 150.00,
          bio: 'Dr. Patel provides comprehensive family medicine care with a focus on preventive health.',
          languages: ['English', 'Hindi', 'Gujarati'],
          rating: 4.6,
          totalReviews: 89,
          isVerified: true,
          acceptsInsurance: true,
        },
      },
    },
  });

  console.log('✅ Sample doctors created');

  // Create doctor availability schedules
  const availabilityData = [
    // Dr. Wilson's availability (Monday to Friday, 9 AM to 5 PM)
    { doctorId: doctor1.id, dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { doctorId: doctor1.id, dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { doctorId: doctor1.id, dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { doctorId: doctor1.id, dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { doctorId: doctor1.id, dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
    
    // Dr. Patel's availability (Monday to Saturday, 8 AM to 6 PM)
    { doctorId: doctor2.id, dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }, // Monday
    { doctorId: doctor2.id, dayOfWeek: 2, startTime: '08:00', endTime: '18:00' }, // Tuesday
    { doctorId: doctor2.id, dayOfWeek: 3, startTime: '08:00', endTime: '18:00' }, // Wednesday
    { doctorId: doctor2.id, dayOfWeek: 4, startTime: '08:00', endTime: '18:00' }, // Thursday
    { doctorId: doctor2.id, dayOfWeek: 5, startTime: '08:00', endTime: '18:00' }, // Friday
    { doctorId: doctor2.id, dayOfWeek: 6, startTime: '09:00', endTime: '15:00' }, // Saturday
  ];

  for (const availability of availabilityData) {
    await prisma.doctorAvailability.upsert({
      where: {
        doctorId_dayOfWeek_startTime: {
          doctorId: availability.doctorId,
          dayOfWeek: availability.dayOfWeek,
          startTime: availability.startTime,
        },
      },
      update: {},
      create: availability,
    });
  }

  console.log('✅ Doctor availability schedules created');

  // Create sample appointments
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  nextWeek.setHours(14, 0, 0, 0);

  await prisma.appointment.createMany({
    data: [
      {
        patientId: patient1.id,
        doctorId: doctor1.id,
        scheduledAt: tomorrow,
        type: AppointmentType.CONSULTATION,
        status: AppointmentStatus.SCHEDULED,
        reason: 'Annual checkup',
        symptoms: 'No specific symptoms, routine visit',
      },
      {
        patientId: patient2.id,
        doctorId: doctor2.id,
        scheduledAt: nextWeek,
        type: AppointmentType.FOLLOW_UP,
        status: AppointmentStatus.CONFIRMED,
        reason: 'Blood pressure follow-up',
        symptoms: 'Occasional headaches',
      },
    ],
  });

  console.log('✅ Sample appointments created');

  // Create care coordinator
  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@arogyamitra.com' },
    update: {},
    create: {
      email: 'coordinator@arogyamitra.com',
      firstName: 'Care',
      lastName: 'Coordinator',
      role: UserRole.CARE_COORDINATOR,
      status: UserStatus.ACTIVE,
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Care coordinator created');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📋 Demo Accounts Created:');
  console.log('👤 Admin: admin@arogyamitra.com / password123');
  console.log('🏥 Doctor 1: dr.wilson@hospital.com / password123');
  console.log('🏥 Doctor 2: dr.patel@clinic.com / password123');
  console.log('👨‍⚕️ Patient 1: patient1@example.com / password123');
  console.log('👩‍⚕️ Patient 2: patient2@example.com / password123');
  console.log('🔧 Coordinator: coordinator@arogyamitra.com / password123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });