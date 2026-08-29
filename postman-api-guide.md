# SwasthaSetu Backend API Guide

Base URL for local development:

```text
http://localhost:4000
```

All `POST` requests must use:

```text
Content-Type: application/json
```

No authentication header is required yet. The login endpoint returns a demo token for the frontend to use later.

## 1. Health Check

### Request

```http
GET http://localhost:4000/health
```

This request has no body.

### Expected response

```json
{
  "status": "ok",
  "service": "swasthasetu-backend"
}
```

## 2. Patient Login

### Request

```http
POST http://localhost:4000/api/auth/login
```

### Body

```json
{
  "role": "patient",
  "abhaId": "demo-1234-5678"
}
```

Available demo ABHA IDs:

- `demo-1234-5678`
- `demo-2345-6789`
- `demo-3456-7890`

### Expected response

```json
{
  "user": {
    "id": "patient-id-from-database",
    "name": "Ramesh Kumar",
    "role": "patient",
    "abhaId": "demo-1234-5678"
  },
  "token": "demo-patient-patient-id-from-database"
}
```

Save `user.id` from this response as `patientId` for the session and document requests.

## 3. Doctor Login

### Request

```http
POST http://localhost:4000/api/auth/login
```

### Body

```json
{
  "role": "doctor",
  "email": "priya@swasthasetu.demo",
  "password": "demo-password"
}
```

Another demo doctor is available with `arjun@swasthasetu.demo` and the same password.

### Expected response

```json
{
  "user": {
    "id": "doctor-id-from-database",
    "name": "Dr. Priya Mehta",
    "role": "doctor",
    "isVerified": true
  },
  "token": "demo-doctor-doctor-id-from-database"
}
```

## 4. Get All Patients

### Request

```http
GET http://localhost:4000/api/patients
```

This request has no body. It returns patients with their sessions and insurance records.

## 5. Create a Patient

### Request

```http
POST http://localhost:4000/api/patients
```

### Required body fields

- `name`
- `age`
- `gender`

### Body

```json
{
  "name": "Suresh Patel",
  "age": 51,
  "gender": "Male",
  "abhaId": "demo-4567-8901",
  "address": "Ahmedabad, Gujarat",
  "phone": "9876543210",
  "bloodGroup": "AB+",
  "language": "en"
}
```

`language` defaults to `en` when omitted. The response has status `201`; save its `id` as `patientId`.

## 6. Create an Intake Session

### Request

```http
POST http://localhost:4000/api/sessions
```

### Body

```json
{
  "patientId": "patient-id-from-login-or-create-patient-response",
  "language": "en",
  "mode": "allopathic"
}
```

Allowed values currently used by the backend:

- `language`: `en` or `hi`
- `mode`: `allopathic` or `ayush`

`language` defaults to `en`; `mode` defaults to `allopathic`.

The response has status `201`; save its `id` as `sessionId`.

## 7. Get One Session

### Request

```http
GET http://localhost:4000/api/sessions/session-id
```

Replace `session-id` with the ID returned by `POST /api/sessions`.

This request has no body. The response includes the patient, uploaded documents, conversation log, extracted data, and red flags.

## 8. Upload a Document

### Request

```http
POST http://localhost:4000/api/documents/upload
```

### Body

```json
{
  "sessionId": "session-id-from-create-session-response",
  "patientId": "patient-id-from-login-or-create-patient-response",
  "imageUrl": "https://example.com/lab-report.jpg",
  "documentType": "lab_report"
}
```

The first checkpoint stores the image location only. It does not process OCR yet.

For local testing without a public image URL, use a small data URI:

```json
{
  "sessionId": "session-id-from-create-session-response",
  "patientId": "patient-id-from-login-or-create-patient-response",
  "imageUrl": "data:image/png;base64,REPLACE_WITH_BASE64_DATA",
  "documentType": "prescription"
}
```

`documentType` is optional. Example values are `prescription`, `lab_report`, `discharge_summary`, and `imaging`.

## 9. Doctor Queue

### Request

```http
GET http://localhost:4000/api/doctor/queue
```

This request has no body. It returns completed and in-progress sessions, ordered by update time.

Each queue item includes:

- `token`
- `id` for the session
- `status`
- `patient`
- `documentCount`
- `updatedAt`

## Recommended Postman Test Order

1. Run `POST /api/auth/login` as a patient.
2. Copy the returned `user.id`.
3. Run `POST /api/sessions` with that ID.
4. Copy the returned session `id`.
5. Run `POST /api/documents/upload` using both IDs.
6. Run `GET /api/sessions/:id` to see the saved session and document.
7. Run `GET /api/doctor/queue` to see the session in the doctor queue.

## Starting the Backend

From the project folder:

```powershell
npm run dev
```

The server starts at `http://localhost:4000`.

If the database has not been created yet:

```powershell
npx prisma migrate dev --name init
npm run db:seed
```
