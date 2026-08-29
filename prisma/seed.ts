import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.document.deleteMany();
  await prisma.session.deleteMany();
  await prisma.consent.deleteMany();
  await prisma.insurance.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.provider.deleteMany();

  const patients = await Promise.all([
    prisma.patient.create({ data: { abhaId: 'demo-1234-5678', name: 'Ramesh Kumar', age: 58, gender: 'Male', language: 'hi', bloodGroup: 'B+' } }),
    prisma.patient.create({ data: { abhaId: 'demo-2345-6789', name: 'Anita Sharma', age: 42, gender: 'Female', language: 'en', bloodGroup: 'O+' } }),
    prisma.patient.create({ data: { abhaId: 'demo-3456-7890', name: 'Mohan Das', age: 67, gender: 'Male', language: 'hi', bloodGroup: 'A+' } })
  ]);

  await prisma.provider.createMany({ data: [
    { name: 'Dr. Priya Mehta', email: 'priya@swasthasetu.demo', passwordHash: 'demo-password', specialty: 'General Medicine', institution: 'SwasthaSetu Hospital', isVerified: true },
    { name: 'Dr. Arjun Rao', email: 'arjun@swasthasetu.demo', passwordHash: 'demo-password', specialty: 'Cardiology', institution: 'SwasthaSetu Hospital', isVerified: true }
  ] });

  for (const [index, patient] of patients.entries()) {
    await prisma.session.create({ data: {
      patientId: patient.id,
      language: patient.language,
      status: index === 2 ? 'in_progress' : 'completed',
      currentSection: 'review_of_systems',
      extractedData: JSON.stringify({ chiefComplaint: index === 0 ? 'Chest pain' : 'Routine follow-up' }),
      summary: index === 2 ? null : JSON.stringify({ chiefComplaint: index === 0 ? 'Chest pain' : 'Diabetes follow-up', flags: index === 0 ? ['Review cardiac symptoms'] : [] }),
      summaryStatus: index === 2 ? null : 'draft'
    } });
  }
}

main().finally(() => prisma.$disconnect());