import 'dotenv/config';
import cors from 'cors';
import express, { Request, Response } from 'express';
import { prisma } from './lib/db';
import { parseJson } from './lib/json';

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors({ origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_request, response) => {
  response.json({ status: 'ok', service: 'swasthasetu-backend' });
});

// Demo login: real authentication can replace this contract later without changing callers.
app.post('/api/auth/login', async (request: Request, response: Response) => {
  const { role = 'patient', abhaId, email, password } = request.body ?? {};

  if (role === 'doctor') {
    const provider = await prisma.provider.findUnique({ where: { email } });
    if (!provider || provider.passwordHash !== password) {
      return response.status(401).json({ error: 'Invalid doctor credentials' });
    }
    return response.json({ user: { id: provider.id, name: provider.name, role: 'doctor', isVerified: provider.isVerified }, token: `demo-doctor-${provider.id}` });
  }

  const patient = await prisma.patient.findUnique({ where: { abhaId } });
  if (!patient) return response.status(401).json({ error: 'ABHA ID not found' });
  return response.json({ user: { id: patient.id, name: patient.name, role: 'patient', abhaId: patient.abhaId }, token: `demo-patient-${patient.id}` });
});

app.get('/api/patients', async (_request, response) => {
  const patients = await prisma.patient.findMany({ include: { sessions: true, insurance: true }, orderBy: { createdAt: 'desc' } });
  response.json(patients);
});

app.post('/api/patients', async (request, response) => {
  const { name, age, gender, abhaId, address, phone, bloodGroup, language = 'en' } = request.body ?? {};
  if (!name || age === undefined || !gender) return response.status(400).json({ error: 'name, age, and gender are required' });
  try {
    const patient = await prisma.patient.create({ data: { name, age: Number(age), gender, abhaId, address, phone, bloodGroup, language } });
    response.status(201).json(patient);
  } catch {
    response.status(409).json({ error: 'A patient with this ABHA ID already exists' });
  }
});

app.get('/api/sessions/:id', async (request, response) => {
  const session = await prisma.session.findUnique({ where: { id: request.params.id }, include: { patient: true, documents: true } });
  if (!session) return response.status(404).json({ error: 'Session not found' });
  response.json({ ...session, conversationLog: parseJson(session.conversationLog, []), extractedData: parseJson(session.extractedData, {}), redFlags: parseJson(session.redFlags, []) });
});

app.post('/api/sessions', async (request, response) => {
  const { patientId, language = 'en', mode = 'allopathic' } = request.body ?? {};
  if (!patientId) return response.status(400).json({ error: 'patientId is required' });
  const patient = await prisma.patient.findUnique({ where: { id: patientId } });
  if (!patient) return response.status(404).json({ error: 'Patient not found' });
  const session = await prisma.session.create({ data: { patientId, language, mode } });
  response.status(201).json(session);
});

app.post('/api/documents/upload', async (request, response) => {
  const { sessionId, patientId, imageUrl, documentType } = request.body ?? {};
  if (!sessionId || !patientId || !imageUrl) return response.status(400).json({ error: 'sessionId, patientId, and imageUrl are required' });
  const session = await prisma.session.findFirst({ where: { id: sessionId, patientId } });
  if (!session) return response.status(404).json({ error: 'Session or patient not found' });
  // The first checkpoint stores a URL/data URI. Object storage can be plugged in at this boundary later.
  const document = await prisma.document.create({ data: { sessionId, patientId, imageUrl, documentType } });
  response.status(201).json({ ...document, status: 'uploaded' });
});

app.get('/api/doctor/queue', async (_request, response) => {
  const sessions = await prisma.session.findMany({ where: { status: { in: ['completed', 'in_progress'] } }, include: { patient: true, documents: true }, orderBy: { updatedAt: 'asc' } });
  response.json(sessions.map((session: typeof sessions[number], index: number) => ({ token: index + 1, id: session.id, status: session.summaryStatus ? 'ready_for_review' : session.status, patient: session.patient, documentCount: session.documents.length, updatedAt: session.updatedAt })));
});

app.use((_request, response) => response.status(404).json({ error: 'Route not found' }));

app.listen(port, () => console.log(`SwasthaSetu backend listening on http://localhost:${port}`));
