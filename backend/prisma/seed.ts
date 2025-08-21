import { PrismaClient, UserRole, UserStatus, DoctorStatus, DayOfWeek } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding with Task 3 data...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create specialties first
  const specialties = [
    { name: 'General Medicine', description: 'Primary healthcare and general medical conditions' },
    { name: 'Cardiology', description: 'Heart and cardiovascular system disorders' },
    { name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
    { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' },
    { name: 'Orthopedics', description: 'Musculoskeletal system disorders' },
    { name: 'Gynecology', description: 'Women\'s reproductive health' },
    { name: 'Neurology', description: 'Nervous system disorders' },
    { name: 'Psychiatry', description: 'Mental health and behavioral disorders' },
  ];

  console.log('🏥 Creating medical specialties...');
  const createdSpecialties = [];
  for (const specialty of specialties) {
    const created = await prisma.specialty.upsert({
      where: { name: specialty.name },
      update: {},
      create: specialty,
    });
    createdSpecialties.push(created);
    console.log(`✅ Specialty created: ${created.name}`);
  }

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

  console.log('✅ Admin user created:', admin.email);

  // Create sample patient
  const patient = await prisma.user.upsert({
    where: { email: 'patient@example.com' },
    update: {},
    create: {
      email: 'patient@example.com',
      phone: '+1234567890',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.PATIENT,
      status: UserStatus.ACTIVE,
      passwordHash: hashedPassword,
    },
  });

  console.log('✅ Sample patient created:', patient.email);

  // Create sample doctors
  const doctorsData = [
    {
      email: 'doctor@example.com',
      phone: '+1234567891',
      firstName: 'Dr. Sarah',
      lastName: 'Wilson',
      profile: {
        licenseNumber: 'MED001234',
        yearsOfExperience: 8,
        bio: 'Experienced general practitioner with focus on preventive care and patient education.',
        consultationFee: 500.00,
        clinicName: 'Wilson Medical Center',
        clinicAddress: '123 Health Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        specialties: ['General Medicine'],
        availability: [
          { dayOfWeek: DayOfWeek.MONDAY, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: DayOfWeek.TUESDAY, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: DayOfWeek.THURSDAY, startTime: '09:00', endTime: '17:00' },
          { dayOfWeek: DayOfWeek.FRIDAY, startTime: '09:00', endTime: '17:00' },
        ],
      },
    },
    {
      email: 'cardiologist@example.com',
      phone: '+1234567892',
      firstName: 'Dr. Rajesh',
      lastName: 'Kumar',
      profile: {
        licenseNumber: 'CARD5678',
        yearsOfExperience: 12,
        bio: 'Specialist in cardiovascular diseases with expertise in interventional cardiology.',
        consultationFee: 1200.00,
        clinicName: 'Heart Care Clinic',
        clinicAddress: '456 Cardiac Avenue',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110001',
        specialties: ['Cardiology'],
        availability: [
          { dayOfWeek: DayOfWeek.MONDAY, startTime: '10:00', endTime: '16:00' },
          { dayOfWeek: DayOfWeek.WEDNESDAY, startTime: '10:00', endTime: '16:00' },
          { dayOfWeek: DayOfWeek.FRIDAY, startTime: '10:00', endTime: '16:00' },
          { dayOfWeek: DayOfWeek.SATURDAY, startTime: '09:00', endTime: '13:00' },
        ],
      },
    },
    {
      email: 'dermatologist@example.com',
      phone: '+1234567893',
      firstName: 'Dr. Priya',
      lastName: 'Sharma',
      profile: {
        licenseNumber: 'DERM9012',
        yearsOfExperience: 6,
        bio: 'Dermatologist specializing in cosmetic and medical skin treatments.',
        consultationFee: 800.00,
        clinicName: 'Skin Solutions',
        clinicAddress: '789 Beauty Lane',
        city: 'Bangalore',
        state: 'Karnataka',
        pincode: '560001',
        specialties: ['Dermatology'],
        availability: [
          { dayOfWeek: DayOfWeek.TUESDAY, startTime: '11:00', endTime: '18:00' },
          { dayOfWeek: DayOfWeek.THURSDAY, startTime: '11:00', endTime: '18:00' },
          { dayOfWeek: DayOfWeek.SATURDAY, startTime: '10:00', endTime: '15:00' },
          { dayOfWeek: DayOfWeek.SUNDAY, startTime: '10:00', endTime: '14:00' },
        ],
      },
    },
  ];

  console.log('👨‍⚕️ Creating sample doctors with profiles...');
  for (const doctorData of doctorsData) {
    const { profile, ...userData } = doctorData;
    
    // Create doctor user
    const doctor = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        ...userData,
        role: UserRole.DOCTOR,
        status: UserStatus.ACTIVE,
        passwordHash: hashedPassword,
      },
    });

    // Find specialty IDs
    const doctorSpecialties = createdSpecialties.filter(s => 
      profile.specialties.includes(s.name)
    );

    // Create doctor profile
    const doctorProfile = await prisma.doctorProfile.upsert({
      where: { userId: doctor.id },
      update: {},
      create: {
        userId: doctor.id,
        licenseNumber: profile.licenseNumber,
        yearsOfExperience: profile.yearsOfExperience,
        bio: profile.bio,
        consultationFee: profile.consultationFee,
        clinicName: profile.clinicName,
        clinicAddress: profile.clinicAddress,
        city: profile.city,
        state: profile.state,
        pincode: profile.pincode,
        status: DoctorStatus.VERIFIED,
        isVerified: true,
        verifiedAt: new Date(),
        specialties: {
          create: doctorSpecialties.map(specialty => ({
            specialtyId: specialty.id,
          })),
        },
        availability: {
          create: profile.availability,
        },
      },
    });

    console.log(`✅ Doctor created: ${doctor.firstName} ${doctor.lastName} (${profile.specialties.join(', ')})`);
  }

  // Create sample appointments
  console.log('📅 Creating sample appointments...');
  
  // Get doctor profiles for appointments
  const doctorProfiles = await prisma.doctorProfile.findMany({
    include: { user: true },
  });

  if (doctorProfiles.length > 0 && patient) {
    // Create some sample appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    const sampleAppointments = [
      {
        patientId: patient.id,
        doctorId: doctorProfiles[0].userId,
        doctorProfileId: doctorProfiles[0].id,
        appointmentDate: tomorrow,
        startTime: '10:00',
        endTime: '10:30',
        consultationFee: doctorProfiles[0].consultationFee,
        symptoms: 'Regular checkup and general consultation',
        status: 'CONFIRMED' as any,
      },
      {
        patientId: patient.id,
        doctorId: doctorProfiles[1]?.userId || doctorProfiles[0].userId,
        doctorProfileId: doctorProfiles[1]?.id || doctorProfiles[0].id,
        appointmentDate: dayAfterTomorrow,
        startTime: '14:30',
        endTime: '15:00',
        consultationFee: doctorProfiles[1]?.consultationFee || doctorProfiles[0].consultationFee,
        symptoms: 'Chest pain and breathing issues',
        status: 'PENDING' as any,
      },
    ];

    for (const appointmentData of sampleAppointments) {
      const appointment = await prisma.appointment.create({
        data: appointmentData,
      });
      console.log(`✅ Sample appointment created: ${appointment.id}`);
    }
  }

  // Create health check record
  const healthCheck = await prisma.healthCheck.create({
    data: {
      status: 'database_seeded_task4',
    },
  });

  console.log('✅ Health check record created:', healthCheck.id);

  console.log('🎉 Database seeding completed successfully with Task 4 data!');
  console.log('\n📋 Demo Accounts Created:');
  console.log('👤 Admin: admin@arogyamitra.com / password123');
  console.log('🏥 General Doctor: doctor@example.com / password123');
  console.log('❤️ Cardiologist: cardiologist@example.com / password123');
  console.log('🌟 Dermatologist: dermatologist@example.com / password123');
  console.log('👨‍⚕️ Patient: patient@example.com / password123');
  console.log('\n🏥 Medical Specialties Created:');
  createdSpecialties.forEach(s => console.log(`   • ${s.name}`));
  console.log('\n📅 Sample Appointments Created for testing booking system');
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