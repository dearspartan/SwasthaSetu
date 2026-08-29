# SwasthaSetu — SIH Implementation Plan

> **Goal:** Convert the SwasthaSetu solution into a working, demonstrable, technically credible Smart India Hackathon prototype through a controlled checkpoint-by-checkpoint development process.

---

## 1. SYSTEM DECOMPOSITION

### Division 1 — Frontend / Patient Interface

**Purpose:** The primary touchpoint — a PWA where patients complete clinical intake via voice and touch.

**Responsibilities:**
- Language selection screen with audio + icon-driven UI
- Conversational interview screens (one question per screen, dual-mode voice + tap)
- Document upload / camera capture screens
- Consent screens with audio explanation
- Progress indicator across the intake journey
- AYUSH mode toggle and Ayurvedic assessment screens
- Red-flag alert display (patient sees "please proceed to triage")
- Session summary confirmation screen (patient reviews before submission)

**Interactions with other divisions:**
- Sends voice audio blobs → Voice/Speech Layer for ASR
- Receives TTS audio → plays audio prompts
- Sends structured responses → Backend API
- Receives next question / options → from Clinical Conversation Engine via Backend
- Sends document images → Document Intelligence pipeline via Backend
- Receives consent forms → from Consent/Privacy module

**SIH Prototype — Must implement:**
- Full patient journey flow (identify → converse → scan → summarize)
- Icon-driven, large-button UI for at least 2 languages (Hindi + English)
- Voice recording + playback
- Document photo capture / upload
- Mobile-responsive design

**Can be mocked/simulated:**
- Actual kiosk hardware integration
- Language auto-detect (use explicit selection instead)
- Full 8-language coverage (do 2–3 for demo)

**Future/Production:**
- Full 8+ language support
- Offline service worker caching of all UI assets
- Kiosk-mode lockdown for hospital deployment
- Biometric input peripherals

---

### Division 2 — Doctor / Hospital Dashboard

**Purpose:** The physician-facing interface where doctors view, edit, and confirm patient history summaries.

**Responsibilities:**
- Patient queue / token list with intake-completion status
- Clinical history summary display (structured, formatted per Module C spec)
- Inline editing of any summary section
- Accept / Amend / Reject controls
- Flags panel (abnormal labs, drug interactions, red flags)
- Medical timeline from digitized documents
- Post-consultation record update (doctor adds prescriptions, notes)
- Provider verification status display

**Interactions:**
- Reads structured patient data → from Backend / Database
- Writes edits/confirmations → to Backend
- Receives real-time intake completion events → via WebSocket or polling
- Views FHIR-structured data → from FHIR layer

**SIH Prototype — Must implement:**
- Summary view with all clinical sections (CC, HPI, PMH, Drugs, Allergies, Family, Personal, ROS, Prior Investigations)
- Edit/confirm/reject buttons
- Flags display (abnormal values, red flags)
- Patient queue list

**Can be mocked:**
- Real-time WebSocket push (use polling or manual refresh)
- Full post-consultation record entry (show UI, stub the save)

**Future/Production:**
- Full HIS/EMR integration
- Multi-doctor concurrent access
- Audit trail of all edits
- Role-based access (doctor, nurse, admin)

---

### Division 3 — Backend / API Layer

**Purpose:** The central nervous system — routes requests between frontend, AI services, database, and external integrations.

**Responsibilities:**
- RESTful API for all frontend operations
- Session management (patient intake sessions)
- Request routing to AI services (LLM, OCR, ASR, TTS)
- Business logic (red-flag evaluation, consent enforcement, data validation)
- Queue/token management
- Provider verification logic
- FHIR resource generation
- ABDM API gateway (or mock)

**Interactions:**
- Patient Frontend ↔ Backend (REST/JSON)
- Doctor Dashboard ↔ Backend (REST/JSON)
- Backend → AI Layer (internal API calls)
- Backend → Database (ORM/queries)
- Backend → FHIR module (resource generation)
- Backend → ABDM mock/sandbox (external APIs)

**SIH Prototype — Must implement:**
- Patient session CRUD (create, read, update, complete)
- Clinical interview state machine (tracks which section the patient is on, what's been answered)
- Document upload endpoint
- Summary generation endpoint
- Doctor dashboard data endpoints
- Authentication endpoints (simplified)

**Can be mocked:**
- ABDM API calls (return mock responses)
- HIS/EMR push (log the FHIR bundle, don't send anywhere)
- Provider NMC verification (use a hardcoded lookup table)

**Future/Production:**
- Rate limiting, throttling, API gateway
- Horizontal scaling
- Message queue for async AI processing
- Full ABDM sandbox then production integration

---

### Division 4 — Database / Data Layer

**Purpose:** Persistent storage of patient profiles, sessions, clinical data, documents, and provider information.

**Responsibilities:**
- Patient records (demographics, ABHA ID, language preference)
- Intake session data (conversation state, responses per section)
- Clinical history structured data (CC, HPI, PMH, etc.)
- Document metadata and extracted entities
- Provider profiles and verification status
- Insurance/mediclaim records
- Consent records and audit trail
- AYUSH assessment data
- FHIR resource storage

**Interactions:**
- Backend reads/writes all data
- FHIR module reads clinical data to generate resources
- Summary generator reads conversation + document data

**SIH Prototype — Must implement:**
- Core schema: patients, sessions, clinical_history sections, documents, document_entities, providers, consents
- Seed data (3–5 demo patients with complete histories for demo)
- Basic indexes for lookup by ABHA ID, session ID

**Can be mocked:**
- Insurance/mediclaim data (hardcoded demo data)
- ABHA-linked history retrieval (use local DB, not real ABDM pull)

**Future/Production:**
- Encryption at rest (AES-256)
- Database replication and backups
- FHIR-native data store (HAPI FHIR server)
- Data archival and retention policies per DPDP Act

---

### Division 5 — AI / ML Layer (Clinical Conversation Engine)

**Purpose:** The brain of Module A — drives the adaptive clinical interview using LLM-based reasoning.

**Responsibilities:**
- Receive patient input (text, already transcribed from voice) + conversation history
- Determine the current stage in the clinical interview flow
- Generate the next question with clinical reasoning (SOCRATES, OLDCARTS)
- Provide touch-mode options (multiple choice) alongside each question
- Extract structured clinical entities from free-form patient responses
- Detect red-flag symptom combinations
- AYUSH mode: conduct Dashavidha Pariksha assessment
- Generate the final structured clinical summary (Module C)

**Interactions:**
- Backend sends patient input → AI Layer processes → returns next question + extracted entities
- Receives conversation history as context
- Summary generation: receives full session data → outputs structured summary
- Red-flag detection: runs after every patient response

**SIH Prototype — Must implement:**
- LLM-based clinical interview (using Gemini API or equivalent with carefully crafted system prompts)
- Structured output: each LLM response returns JSON with (next_question, options[], extracted_entities{}, red_flags[], section_complete: bool)
- System prompt that encodes the clinical interview flow (CC → HPI → PMH → Drugs → Allergies → Family → Personal → ROS)
- SOCRATES/OLDCARTS adaptive questioning for chief complaint deep-dive
- Basic red-flag detection (a set of high-priority symptom combinations)
- Summary generation prompt that compiles all extracted entities into the standard clinical format

**Can be mocked:**
- "Medically fine-tuned" model — use a general-purpose LLM (Gemini 2.0 Flash / GPT-4o-mini) with strong system prompts. Fine-tuning is not needed for the prototype.
- AYUSH mode — implement with a separate system prompt containing Dashavidha Pariksha parameters. The LLM doesn't need Ayurvedic training data; the prompt structure drives the assessment.

**Future/Production:**
- Fine-tuned medical LLM on Indian clinical history datasets
- Validated red-flag detection with clinical sensitivity targets
- ICD-10 / SNOMED-CT entity linking
- AYUSH-specific model trained on Ayurvedic clinical data

---

### Division 6 — Voice / Speech Layer

**Purpose:** Handles speech-to-text (ASR) and text-to-speech (TTS) for multilingual voice interaction.

**Responsibilities:**
- Convert patient voice audio to text (ASR)
- Convert system prompts/questions to speech audio (TTS)
- Language detection (optional — can default to user-selected language)
- Handle noisy audio environments gracefully

**Interactions:**
- Patient Frontend captures audio → sends to Backend → Backend routes to ASR service → returns text
- Backend generates text response → sends to TTS service → returns audio → Frontend plays it

**SIH Prototype — Must implement:**
- Working ASR for Hindi + English (minimum)
- Working TTS for Hindi + English
- Use Web Speech API (browser-native) as the fastest path, with Bhashini API as the Indian-language backend

**Realistic assessment:**
- **Bhashini APIs** (bhashini.gov.in) provide free ASR and TTS for Indian languages. They have a public API. Registration is required but straightforward. This is the ideal choice for SIH.
- **Web Speech API** works in Chrome for English and some Indian languages — good fallback for demo.
- **Google Cloud Speech-to-Text** supports Hindi, Tamil, Bengali, etc. but costs money after free tier.

**Can be mocked:**
- If Bhashini API registration is delayed, use browser Web Speech API for English and demonstrate the architecture with a "Bhashini integration point" that falls back gracefully.
- 8-language coverage — demo 2–3, show architecture supports more.

**Future/Production:**
- Full Bhashini/AI4Bharat integration for all 22 scheduled languages
- Noise cancellation preprocessing
- Speaker diarization (separate patient from ambient noise)
- Streaming ASR for real-time transcription

---

### Division 7 — Medical Document OCR & Document Intelligence

**Purpose:** Module B — digitizes physical medical documents and extracts structured clinical data.

**Responsibilities:**
- Accept document images (camera capture or file upload)
- Classify document type (prescription, lab report, discharge summary, imaging report)
- Perform OCR (printed + handwritten)
- Extract clinical entities (diagnoses, medications, lab values, dates)
- Confidence scoring per extracted field
- Build chronological medical timeline
- Flag abnormal lab values
- Detect potential drug interactions

**Interactions:**
- Frontend sends document images → Backend → Document Intelligence pipeline
- Pipeline returns: document_type, extracted_text, structured_entities[], confidence_scores, abnormal_flags[], timeline_position
- Structured entities feed into the clinical summary (Module C)

**SIH Prototype — Must implement:**
- Document upload + image preprocessing
- OCR using Google Cloud Vision API or Gemini vision (Gemini can do OCR + entity extraction in one call)
- Document classification (prescription vs lab report vs discharge summary)
- Entity extraction: medication names, lab test names + values, diagnoses
- Basic abnormal-value flagging (compare extracted values to hardcoded reference ranges for common tests)

**Can be mocked:**
- Handwritten OCR — demonstrate with printed/typed documents; for handwritten, show the confidence-based flagging ("low confidence — flagged for manual review")
- Drug interaction detection — use a small hardcoded lookup table of 20–30 common interactions
- Full chronological timeline — show date-ordered list, don't need sophisticated date extraction

**Future/Production:**
- Custom handwriting recognition models trained on Indian medical scripts
- Comprehensive drug interaction database (DrugBank integration)
- Full ICD-10 auto-coding from discharge summaries
- Reference range database for all common lab tests (not hardcoded)

---

### Division 8 — FHIR / Healthcare Interoperability

**Purpose:** Structures clinical data as HL7 FHIR R4 resources for interoperability with ABDM and hospital systems.

**Responsibilities:**
- Map internal data models to FHIR resources:
  - Patient → FHIR Patient
  - Clinical history → FHIR Composition
  - Diagnoses → FHIR Condition
  - Medications → FHIR MedicationStatement
  - Allergies → FHIR AllergyIntolerance
  - Lab results → FHIR Observation
  - Documents → FHIR DocumentReference
- Generate FHIR Bundles for health information push
- Validate FHIR resources against R4 schema

**Interactions:**
- Backend / Summary Generator creates clinical data → FHIR module maps to resources
- FHIR resources → ABDM integration module for HIE push
- FHIR resources → Doctor dashboard for display

**SIH Prototype — Must implement:**
- FHIR Patient resource generation from patient profile
- FHIR Composition resource (the clinical summary as a FHIR document)
- FHIR Condition (for each diagnosis in PMH)
- FHIR MedicationStatement (for current medications)
- FHIR AllergyIntolerance
- FHIR Bundle wrapping all resources for a patient encounter
- Display raw FHIR JSON on doctor dashboard as a "FHIR Export" view

**Can be mocked:**
- FHIR validation against official schema (show the JSON structure, don't need a full FHIR validator)
- FHIR server (don't deploy HAPI FHIR — just generate the JSON objects)

**Future/Production:**
- HAPI FHIR server deployment
- FHIR subscription for real-time updates
- Full ABDM FHIR profile compliance testing
- SMART on FHIR for third-party app integration

---

### Division 9 — ABDM / HIE Integration

**Purpose:** Module D — connects SwasthaSetu to the Ayushman Bharat Digital Mission ecosystem.

**Responsibilities:**
- ABHA ID verification and patient lookup
- Health Information Push (HIP) — push structured summary to ABDM HIE
- Health Information Pull (HIU) — pull prior records with consent
- ABHA PHR linking

**Interactions:**
- Backend → ABDM APIs (M1, HIP, HIU)
- Consent module → ABDM consent manager
- FHIR module → provides FHIR bundles for HIP push

**SIH Prototype — Must implement:**
- **Mock ABDM integration** — this is critical to understand:
  - Real ABDM sandbox access requires registration with NHA (National Health Authority), approval as a Health Information Provider (HIP) or Health Information User (HIU), and integration testing. This typically takes weeks-months.
  - For SIH: Create a mock ABDM service that simulates ABHA verification (accepts a demo ABHA ID, returns patient details), simulates HIP push (accepts FHIR bundle, logs it, returns success), and simulates HIU pull (returns pre-loaded demo records).
- Show the correct API architecture — real endpoints, real FHIR payloads — hitting a mock server.
- Present this honestly: "We've built the integration layer against ABDM's API specification. In production, this connects to the real ABDM sandbox/production. For SIH demo, we demonstrate with a mock ABDM service that follows the same contract."

**Future/Production:**
- NHA registration as HIP + HIU
- ABDM sandbox testing and certification
- Production ABDM integration
- ABHA creation flow (Aadhaar OTP)

---

### Division 10 — Authentication & Authorization

**Purpose:** Secure access control for patients, doctors, and hospital admins.

**Responsibilities:**
- Patient authentication: ABHA ID + OTP (or demo login for SIH)
- Doctor/Hospital login: email/password + provider verification status
- Session tokens (JWT)
- Role-based access control (patient, doctor, admin)

**Interactions:**
- Frontend sends credentials → Backend validates → issues JWT
- All subsequent API calls carry JWT → Backend validates role + permissions
- ABDM mock provides ABHA verification

**SIH Prototype — Must implement:**
- Simple JWT-based auth
- Patient login: enter a demo ABHA ID (or register with basic details)
- Doctor login: email + password
- Role-based API protection (patient endpoints vs doctor endpoints)

**Can be mocked:**
- Real Aadhaar OTP verification (use a "demo OTP" that's always 123456)
- NMC registration number verification (hardcoded list of demo doctors)

**Future/Production:**
- Real Aadhaar eKYC / ABHA M1 API integration
- NMC API integration for provider verification
- Multi-factor authentication
- OAuth2/OIDC for hospital SSO

---

### Division 11 — Consent / Privacy / Security

**Purpose:** Module D's consent framework — handles DPDP Act compliance and data protection.

**Responsibilities:**
- Consent capture before any data collection (with audio explanation)
- Granular consent: patient chooses what to capture and who to share with
- Consent storage and audit trail
- Session data purge after submission
- Data encryption in transit (TLS) and at rest

**Interactions:**
- Frontend presents consent screens → Backend stores consent records
- Backend enforces consent: no data captured without active consent
- All API endpoints check consent status before processing

**SIH Prototype — Must implement:**
- Consent screen in patient flow (before interview starts)
- Audio consent explanation (TTS reads consent in patient's language)
- Consent record stored in DB (what was consented, timestamp, patient ID)
- Session purge API (deletes raw voice/document data after summary generation)

**Can be mocked:**
- Real DPDP audit compliance (show the design, acknowledge it needs legal review)
- ABDM consent manager integration (mock it)

**Future/Production:**
- ABDM consent manager API integration
- Formal DPDP Act compliance audit
- Data Protection Officer appointment
- Consent revocation workflow with data deletion cascades

---

### Division 12 — Offline / PWA Functionality

**Purpose:** Ensure the platform works in low-connectivity hospital environments.

**Responsibilities:**
- Service Worker for offline caching of UI assets
- Local storage of in-progress session data
- Background sync when connectivity is restored
- Installable PWA (add to home screen)

**Interactions:**
- Frontend Service Worker caches static assets
- IndexedDB stores session data locally
- Sync manager pushes data to Backend when online

**SIH Prototype — Must implement:**
- PWA manifest (installable)
- Basic Service Worker caching of static assets
- Show that the app loads without network

**Can be mocked:**
- Full offline interview flow (complex — would require embedding the LLM locally or caching all possible questions)
- Conflict resolution for offline sync

**Future/Production:**
- Full offline interview with pre-cached question trees
- Robust conflict resolution
- Offline document scanning with deferred OCR processing
- Background sync with retry logic

---

### Division 13 — Infrastructure / Deployment

**Purpose:** Where and how the system runs.

**Responsibilities:**
- Application hosting
- Database hosting
- AI API management
- Environment configuration
- CI/CD (optional for SIH)

**SIH Prototype — Must implement:**
- Single deployment target (Railway / Render / Vercel + separate backend)
- Environment variables for API keys
- Database hosting (Supabase / PlanetScale / local SQLite for demo)

**Future/Production:**
- Kubernetes / Cloud Run deployment
- Auto-scaling
- Multi-region deployment
- Monitoring, logging, alerting
- Load testing for 5,000+ concurrent users

---

### Division 14 — Testing & Evaluation

**Purpose:** Verify that the system works correctly and demo-ready.

**SIH Prototype — Must implement:**
- End-to-end demo script (specific patient scenarios to walk through)
- 3–5 pre-built demo scenarios with seed data
- Manual testing of all critical paths
- Verify: patient flow → interview → document scan → summary → doctor view

**Future/Production:**
- Unit tests for all backend endpoints
- Integration tests for AI pipeline
- Load testing
- Accessibility audit (WCAG 2.1)
- Clinical validation with actual physicians

---

## 2. RECOMMENDED TECH STACK

| Division | Recommended Technology | Alternatives | Why | SIH Priority |
|----------|----------------------|-------------|-----|--------------|
| **Frontend** | **Next.js 14 (App Router) + Tailwind CSS** | React + Vite, SvelteKit | Next.js gives SSR, API routes, PWA support in one framework. Tailwind enables rapid accessible UI. Massive ecosystem. | Critical |
| **Backend** | **Next.js API Routes + (optional) separate FastAPI for AI** | Express.js, Django | Next.js API routes handle most needs. FastAPI only if you need a separate Python service for AI orchestration. Keeps the stack simple. | Critical |
| **Database** | **PostgreSQL via Supabase** | SQLite (local dev), PlanetScale (MySQL) | Supabase gives free-tier Postgres + auth + realtime + storage. One service covers DB + file storage + auth. | Critical |
| **ORM** | **Prisma** | Drizzle, TypeORM | Type-safe, excellent migration system, works perfectly with Next.js + Supabase Postgres. | Critical |
| **LLM / Clinical AI** | **Google Gemini 2.0 Flash (via google-genai SDK)** | GPT-4o-mini, Claude Haiku | Free generous tier, excellent structured output (JSON mode), strong multilingual capability, fast. Perfect for SIH budget (zero cost). | Critical |
| **ASR (Speech-to-Text)** | **Web Speech API (browser) + Bhashini API (Indian languages)** | Google Cloud STT, Whisper | Web Speech API is zero-cost and works instantly in Chrome. Bhashini is free and government-backed — ideal narrative for SIH. | Critical |
| **TTS (Text-to-Speech)** | **Web Speech API (browser) + Bhashini TTS** | Google Cloud TTS, ElevenLabs | Same rationale — zero cost, browser-native, with Bhashini for Hindi/regional. | Critical |
| **OCR / Document AI** | **Gemini 2.0 Flash Vision (multimodal)** | Google Cloud Vision, Tesseract | Gemini can do OCR + document classification + entity extraction in a single API call with a well-crafted prompt. Eliminates need for 3 separate services. Massively simplifies the pipeline. | Critical |
| **FHIR** | **Manual JSON construction (FHIR R4 schema)** | HAPI FHIR (Java), fhir.js | For SIH, hand-constructing FHIR JSON objects is fastest. No need for a full FHIR server. Use TypeScript interfaces matching R4 schema. | Important |
| **Auth** | **Supabase Auth + JWT** | NextAuth.js, Firebase Auth | Already using Supabase — its auth is built-in, supports email/password and OTP. | Critical |
| **File Storage** | **Supabase Storage** | AWS S3, Cloudinary | Already using Supabase. Built-in, free tier sufficient. | Critical |
| **Deployment** | **Vercel (frontend + API) + Supabase (DB + storage)** | Railway, Render, Fly.io | Vercel has free tier, deploys Next.js natively, handles HTTPS/SSL. Supabase is already the DB. Two services, zero cost. | Critical |
| **PWA** | **next-pwa / Serwist** | Workbox | Minimal config to add PWA to Next.js. | Important |
| **State Management** | **Zustand or React Context** | Redux, Jotai | Zustand is tiny, simple, perfect for session/interview state. Don't over-engineer. | Important |
| **UI Components** | **shadcn/ui + Radix Primitives** | Material UI, Chakra | Accessible by default, customizable with Tailwind, no CSS-in-JS overhead. Large touch targets easy to implement. | Important |

### Primary Stack Summary

```
Frontend:    Next.js 14 + Tailwind CSS + shadcn/ui + Zustand
Backend:     Next.js API Routes (TypeScript)
Database:    PostgreSQL (Supabase)
ORM:         Prisma
AI/LLM:      Gemini 2.0 Flash (google-genai SDK)
Voice:       Web Speech API + Bhashini API
OCR:         Gemini 2.0 Flash Vision (multimodal)
Auth:        Supabase Auth
Storage:     Supabase Storage
FHIR:        Hand-built JSON (TypeScript interfaces)
ABDM:        Mock service (same API contract)
Deployment:  Vercel + Supabase
```

**Why this stack:** Zero cost. TypeScript end-to-end. One AI provider (Gemini) handles LLM + OCR + document intelligence. One infrastructure provider (Supabase) handles DB + auth + storage. One deployment target (Vercel). Maximum speed, minimum complexity.

---

## 3. SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           PATIENT DEVICE                                │
│                    (Browser / Kiosk / Mobile)                           │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Next.js PWA Frontend                         │    │
│  │                                                                 │    │
│  │  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────┐  │    │
│  │  │ Language  │  │ Interview │  │ Document │  │   Summary    │  │    │
│  │  │ & Consent │→ │  Screens  │→ │  Upload  │→ │ Confirmation │  │    │
│  │  └──────────┘  └───────────┘  └──────────┘  └──────────────┘  │    │
│  │       │              │              │              │            │    │
│  │       │         ┌────┴────┐         │              │            │    │
│  │       │         │ Web     │         │              │            │    │
│  │       │         │ Speech  │         │              │            │    │
│  │       │         │ API     │         │              │            │    │
│  │       │         │(ASR/TTS)│         │              │            │    │
│  │       │         └─────────┘         │              │            │    │
│  └───────┼─────────────┼──────────────┼──────────────┼────────────┘    │
│          │             │              │              │                  │
└──────────┼─────────────┼──────────────┼──────────────┼──────────────────┘
           │             │              │              │
           ▼             ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     NEXT.JS API ROUTES (Backend)                       │
│                                                                         │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Auth API │  │ Session API  │  │ Document API │  │ Summary API  │   │
│  │          │  │              │  │              │  │              │   │
│  │ • login  │  │ • create     │  │ • upload     │  │ • generate   │   │
│  │ • verify │  │ • next_q     │  │ • process    │  │ • get        │   │
│  │ • consent│  │ • submit_ans │  │ • extract    │  │ • edit       │   │
│  │          │  │ • red_flag   │  │ • classify   │  │ • confirm    │   │
│  └────┬─────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│       │               │                 │                  │           │
│       │               ▼                 ▼                  ▼           │
│       │    ┌────────────────────────────────────────────────────┐      │
│       │    │              AI SERVICE LAYER                      │      │
│       │    │                                                    │      │
│       │    │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │      │
│       │    │  │ Gemini LLM  │  │ Gemini Vision│  │ Bhashini │ │      │
│       │    │  │ (Interview  │  │ (OCR + Doc   │  │ ASR/TTS  │ │      │
│       │    │  │  + Summary) │  │  Intelligence│  │ (fallback│ │      │
│       │    │  │             │  │  in one call)│  │  for Indic│ │      │
│       │    │  └─────────────┘  └──────────────┘  │ languages)│ │      │
│       │    │                                      └──────────┘ │      │
│       │    └────────────────────────────────────────────────────┘      │
│       │                         │                                      │
│       ▼                         ▼                                      │
│  ┌──────────────────────────────────────────────┐                      │
│  │           SUPABASE (PostgreSQL + Storage)     │                      │
│  │                                               │                      │
│  │  Tables: patients, sessions, clinical_history,│                      │
│  │  documents, document_entities, providers,     │                      │
│  │  consents, medications, insurance             │                      │
│  │                                               │                      │
│  │  Storage: uploaded document images             │                      │
│  └──────────────────────────────────────────────┘                      │
│                         │                                              │
│  ┌──────────────────────┼───────────────────────────┐                  │
│  │     INTEROPERABILITY LAYER                        │                  │
│  │                                                   │                  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────┐ │                  │
│  │  │ FHIR R4     │  │ ABDM Mock    │  │ HIS/EMR  │ │                  │
│  │  │ Resource    │  │ Service      │  │ Mock     │ │                  │
│  │  │ Generator   │  │ (ABHA verify,│  │ (logs    │ │                  │
│  │  │             │  │  HIP push,   │  │  FHIR    │ │                  │
│  │  │             │  │  HIU pull)   │  │  bundle) │ │                  │
│  │  └─────────────┘  └──────────────┘  └──────────┘ │                  │
│  └───────────────────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│                        DOCTOR DEVICE (Browser)                          │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                    Doctor Dashboard                              │    │
│  │                                                                 │    │
│  │  ┌──────────┐  ┌───────────────┐  ┌─────────────────────────┐  │    │
│  │  │ Patient  │  │ Clinical      │  │ Post-Consultation       │  │    │
│  │  │ Queue    │→ │ Summary View  │→ │ Record Update           │  │    │
│  │  │ (tokens) │  │ (edit/confirm)│  │ (add Rx, notes)         │  │    │
│  │  └──────────┘  └───────────────┘  └─────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

### Document Processing Pipeline (Detail)

```
Document Image (from camera/upload)
         │
         ▼
┌──────────────────────────────────────────────────┐
│  Gemini 2.0 Flash Vision — SINGLE API CALL       │
│                                                   │
│  System Prompt:                                   │
│  "You are a medical document analyzer.            │
│   Given this image of a medical document:         │
│   1. Classify: prescription/lab_report/           │
│      discharge_summary/imaging_report             │
│   2. Extract all text (OCR)                       │
│   3. Extract structured entities:                 │
│      - medications: [{name, dose, frequency}]     │
│      - diagnoses: [{name, icd_code_if_possible}]  │
│      - lab_results: [{test, value, unit, range,   │
│        is_abnormal}]                              │
│      - procedures: [{name, date}]                 │
│   4. Extract document date                        │
│   5. Provide confidence score (0-1)               │
│   Return as structured JSON."                     │
│                                                   │
│  → Uses Gemini's multimodal + JSON mode           │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
         Structured JSON Response
                   │
         ┌─────────┼─────────┐
         │         │         │
         ▼         ▼         ▼
  ┌──────────┐ ┌───────┐ ┌──────────┐
  │ Store in │ │ Flag  │ │ Add to   │
  │ document_│ │abnorm │ │ medical  │
  │ entities │ │values │ │ timeline │
  │ table    │ │       │ │          │
  └──────────┘ └───────┘ └──────────┘
```

### Conversational Pipeline (Detail)

```
Patient Voice/Touch Input
         │
         ├── Voice: browser mic → Web Speech API (or Bhashini ASR) → text
         │
         └── Touch: tap selection → text value
                   │
                   ▼
         ┌─────────────────────────────────────────┐
         │  Backend: /api/session/next              │
         │                                          │
         │  Payload:                                │
         │  {                                       │
         │    session_id,                           │
         │    patient_input: "text",                │
         │    input_mode: "voice" | "touch",        │
         │    current_section: "chief_complaint"    │
         │  }                                       │
         └──────────────────┬──────────────────────┘
                            │
                            ▼
         ┌─────────────────────────────────────────┐
         │  Gemini LLM — Clinical Interview        │
         │                                          │
         │  System Prompt includes:                 │
         │  • Clinical interview flow structure     │
         │  • Current section + conversation history│
         │  • SOCRATES/OLDCARTS frameworks          │
         │  • Red-flag symptom list                 │
         │  • Instructions to return JSON:          │
         │    {                                     │
         │      next_question: "string",            │
         │      options: ["opt1", "opt2", "opt3"],  │
         │      extracted: {                        │
         │        field: "value"                    │
         │      },                                  │
         │      red_flags: [],                      │
         │      section_complete: false,            │
         │      next_section: null                  │
         │    }                                     │
         └──────────────────┬──────────────────────┘
                            │
                   ┌────────┼────────┐
                   │        │        │
                   ▼        ▼        ▼
            ┌──────────┐ ┌──────┐ ┌──────────┐
            │ Store    │ │ Check│ │ Send to  │
            │extracted │ │ red  │ │ frontend │
            │entities  │ │flags │ │(question │
            │in DB     │ │→alert│ │+ options)│
            └──────────┘ └──────┘ └──────────┘
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | Patient or doctor login |
| `/api/auth/verify-otp` | POST | OTP verification (mock) |
| `/api/patients` | GET/POST | Patient CRUD |
| `/api/patients/[id]` | GET/PUT | Patient profile |
| `/api/sessions` | POST | Create new intake session |
| `/api/sessions/[id]` | GET | Get session state |
| `/api/sessions/[id]/next` | POST | Submit answer, get next question |
| `/api/sessions/[id]/consent` | POST | Record consent |
| `/api/sessions/[id]/red-flag` | GET | Check red flags for session |
| `/api/documents/upload` | POST | Upload document image |
| `/api/documents/[id]/process` | POST | Trigger OCR + extraction |
| `/api/documents/[id]/entities` | GET | Get extracted entities |
| `/api/summary/[session_id]` | GET | Get generated summary |
| `/api/summary/[session_id]/generate` | POST | Trigger summary generation |
| `/api/summary/[session_id]/edit` | PUT | Doctor edits summary |
| `/api/summary/[session_id]/confirm` | POST | Doctor confirms summary |
| `/api/fhir/bundle/[session_id]` | GET | Get FHIR bundle for session |
| `/api/abdm/verify-abha` | POST | Verify ABHA ID (mock) |
| `/api/abdm/push` | POST | Push to ABDM HIE (mock) |
| `/api/providers` | GET/POST | Provider CRUD |
| `/api/providers/verify` | POST | Verify NMC registration (mock) |
| `/api/doctor/queue` | GET | Doctor's patient queue |
| `/api/doctor/patients/[id]/summary` | GET | Get patient summary for doctor |

---

## 4. SIH MVP vs PRODUCTION CLASSIFICATION

### MUST HAVE — Required for convincing SIH prototype

| Feature | Scope for SIH |
|---------|---------------|
| Patient intake flow (language → consent → interview → scan → summary) | Full flow, 2 languages (Hindi + English) |
| AI clinical interview (adaptive, SOCRATES-based) | Gemini with clinical system prompt, 5+ clinical scenarios |
| Dual-mode input (voice + touch) | Web Speech API + tap buttons on every question |
| Document upload + OCR + entity extraction | Gemini Vision, works on printed documents, demo with 3–5 sample docs |
| Structured clinical summary generation | Full Module C format (CC, HPI, PMH, Drugs, Allergies, Family, Personal, ROS, Prior Investigations) |
| Doctor dashboard with summary view | View, edit, confirm/reject |
| Red-flag detection + alert | Detect 4–5 emergency patterns, show alert on doctor dashboard |
| FHIR resource generation | Generate valid FHIR JSON for Patient, Composition, Condition, MedicationStatement |
| Basic auth (patient + doctor login) | Supabase Auth, simplified |
| Consent capture with audio | Consent screen, TTS reads it aloud |
| Seed/demo data | 3–5 pre-built patient scenarios |
| End-to-end demo flow | A scripted walkthrough from patient entry to doctor review |

### SHOULD HAVE — Valuable if core is done

| Feature | Notes |
|---------|-------|
| AYUSH / Dashavidha Pariksha mode | Separate system prompt for AYUSH interview — achievable if Module A is solid |
| Abnormal value highlighting in scanned documents | Compare extracted lab values to reference ranges |
| Medical timeline from documents | Date-ordered document list |
| Insurance/Mediclaim display | Hardcoded demo data, display on patient profile |
| Verified provider badge | Flag in DB, display in UI |
| PWA installability | manifest.json + basic service worker |
| ABDM mock integration | Mock service that accepts/returns correct API shapes |
| Bilingual summary output | English summary for doctor, Hindi audio readback for patient |
| 3rd language support (e.g., Tamil or Marathi) | If Bhashini API is working |

### FUTURE / PRODUCTION — Should NOT block SIH prototype

| Feature | Why it can't be done for SIH |
|---------|------------------------------|
| Real ABDM sandbox integration | Requires NHA registration, HIP/HIU approval — weeks/months |
| Real Aadhaar OTP / ABHA creation | Requires UIDAI credentials |
| Fine-tuned medical LLM | Requires clinical training data, compute, validation |
| Handwritten OCR with custom models | Requires training data of Indian medical handwriting |
| Drug interaction database (full) | Requires DrugBank/OpenFDA integration |
| ICD-10 / SNOMED-CT auto-coding | Requires licensed terminology servers |
| Full 22-language support | Requires extensive testing per language |
| Kiosk hardware integration | Physical hardware procurement |
| Hospital HIS/EMR integration | Each hospital has different systems |
| DPDP Act formal compliance audit | Legal process |
| Production-grade security (pen testing, SOC2) | Enterprise process |
| Horizontal scaling for 5000+ users | Infrastructure engineering |

---

## 5. CHECKPOINT-BASED DEVELOPMENT PLAN

---

### Checkpoint 0 — Project Foundation

**Objective:** Set up the project repository, tech stack, folder structure, and deployment pipeline. After this checkpoint, the team can code in parallel with a shared foundation.

**Prerequisites:** None.

**Implementation Tasks:**
1. Create Next.js 14 project with App Router and TypeScript
2. Install and configure: Tailwind CSS, shadcn/ui, Prisma, Supabase client, Zustand, google-genai SDK
3. Set up Supabase project (DB + Auth + Storage)
4. Configure environment variables (.env.local): `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `BHASHINI_API_KEY` (if available)
5. Create project folder structure:
   ```
   swasthasetu/
   ├── prisma/
   │   └── schema.prisma
   ├── src/
   │   ├── app/
   │   │   ├── (patient)/          # Patient-facing routes
   │   │   ├── (doctor)/           # Doctor dashboard routes
   │   │   ├── api/                # API routes
   │   │   ├── layout.tsx
   │   │   └── page.tsx
   │   ├── components/
   │   │   ├── ui/                 # shadcn components
   │   │   ├── patient/            # Patient-specific components
   │   │   └── doctor/             # Doctor-specific components
   │   ├── lib/
   │   │   ├── ai/                 # Gemini service, prompts
   │   │   ├── fhir/               # FHIR resource builders
   │   │   ├── abdm/               # ABDM mock service
   │   │   ├── voice/              # ASR/TTS wrappers
   │   │   ├── db.ts               # Prisma client
   │   │   └── supabase.ts         # Supabase client
   │   ├── store/                  # Zustand stores
   │   ├── types/                  # TypeScript types
   │   └── constants/              # Clinical data, red flags, reference ranges
   ├── public/
   │   ├── icons/                  # Large icon assets for UI
   │   └── audio/                  # Pre-recorded audio (if needed)
   ├── .env.local
   ├── next.config.js
   ├── tailwind.config.ts
   └── package.json
   ```
6. Set up Vercel deployment (connect GitHub repo → auto-deploy on push)
7. Create a basic landing page at `/` that shows "SwasthaSetu" with patient and doctor entry points
8. Verify Supabase connection and Gemini API key work

**Components Affected:** All (foundation)

**Definition of Done:**
- `npm run dev` starts the app locally without errors
- Landing page renders at `localhost:3000`
- Supabase connection verified (can query an empty table)
- Gemini API responds to a test prompt
- App deployed to Vercel and accessible via URL
- Git repo initialized with first commit

**Testing / Demo:** Visit the Vercel URL, see the landing page.

**Complexity:** Low

**Priority:** Critical

---

### Checkpoint 1 — Database Schema & Backend Foundation

**Objective:** Define the complete database schema and create the core backend API structure. After this, other team members can build frontend/AI features against stable API contracts.

**Prerequisites:** Checkpoint 0

**Implementation Tasks:**
1. Design and implement Prisma schema:
   ```prisma
   model Patient {
     id            String   @id @default(cuid())
     abhaId        String?  @unique
     name          String
     age           Int
     gender        String
     address       String?
     phone         String?
     bloodGroup    String?
     language      String   @default("en")
     createdAt     DateTime @default(now())
     sessions      Session[]
     documents     Document[]
     consents      Consent[]
     insurance     Insurance[]
   }

   model Provider {
     id                String   @id @default(cuid())
     name              String
     email             String   @unique
     passwordHash      String
     registrationNumber String?
     specialty         String?
     institution       String?
     isVerified        Boolean  @default(false)
     createdAt         DateTime @default(now())
   }

   model Session {
     id              String   @id @default(cuid())
     patientId       String
     patient         Patient  @relation(fields: [patientId], references: [id])
     mode            String   @default("allopathic") // allopathic | ayush
     language        String
     status          String   @default("in_progress") // in_progress | completed | abandoned
     currentSection  String   @default("chief_complaint")
     conversationLog Json     @default("[]") // full conversation history
     extractedData   Json     @default("{}") // structured clinical data
     redFlags        Json     @default("[]")
     summary         Json?    // generated summary
     summaryStatus   String?  // draft | confirmed | rejected
     confirmedBy     String?  // provider ID
     consentId       String?
     createdAt       DateTime @default(now())
     updatedAt       DateTime @updatedAt
     documents       Document[]
   }

   model Document {
     id              String   @id @default(cuid())
     sessionId       String
     session         Session  @relation(fields: [sessionId], references: [id])
     patientId       String
     patient         Patient  @relation(fields: [patientId], references: [id])
     imageUrl        String
     documentType    String?  // prescription | lab_report | discharge_summary | imaging
     extractedText   String?
     entities        Json?    // extracted structured entities
     confidence      Float?
     documentDate    DateTime?
     createdAt       DateTime @default(now())
   }

   model Consent {
     id              String   @id @default(cuid())
     patientId       String
     patient         Patient  @relation(fields: [patientId], references: [id])
     consentType     String   // history | documents | both
     shareWith       String   // hospital | abha | both
     grantedAt       DateTime @default(now())
     revokedAt       DateTime?
     isActive        Boolean  @default(true)
   }

   model Insurance {
     id              String   @id @default(cuid())
     patientId       String
     patient         Patient  @relation(fields: [patientId], references: [id])
     provider        String
     policyNumber    String
     coverageType    String
     sumInsured      Float?
     waitingPeriodEnd DateTime?
     isActive        Boolean  @default(true)
   }
   ```
2. Run `npx prisma migrate dev` to create tables
3. Create seed script (`prisma/seed.ts`) with 3–5 demo patients, 1–2 demo doctors, sample insurance data
4. Create core API route stubs (return mock data initially):
   - `/api/auth/login`
   - `/api/patients`
   - `/api/sessions`
   - `/api/documents/upload`
   - `/api/doctor/queue`
5. Create Prisma client singleton (`src/lib/db.ts`)
6. Create TypeScript types (`src/types/`) matching the schema

**Components Affected:** Database, Backend

**Definition of Done:**
- `npx prisma studio` shows all tables with correct schema
- Seed data loads successfully (3 patients, 2 doctors visible in Prisma Studio)
- API stubs return JSON responses (can test with curl/Postman)
- TypeScript types compile without errors

**Testing / Demo:** Open Prisma Studio, show tables and seed data. Hit API stubs with curl.

**Complexity:** Medium

**Priority:** Critical

---

### Checkpoint 2 — Authentication & Patient Onboarding

**Objective:** Patients can log in (demo ABHA flow) and doctors can log in. Consent is captured before any data collection.

**Prerequisites:** Checkpoint 1

**Implementation Tasks:**
1. Implement patient login page (`/patient/login`):
   - Enter ABHA ID (or demo ID) — text input
   - "Verify" button → mock OTP screen → hardcoded OTP (123456) → success
   - OR "New Patient" → basic registration form (name, age, gender, phone, language)
2. Implement doctor login page (`/doctor/login`):
   - Email + password → Supabase Auth
3. Implement consent screen (`/patient/consent`):
   - Large icon-based consent display
   - "🔊 Listen" button — TTS reads consent aloud
   - Checkboxes: "I consent to history capture" / "I consent to document scanning" / "Share with this hospital" / "Link to ABHA record"
   - Submit → stores consent in DB → redirects to interview
4. Create auth middleware for API routes (check JWT)
5. Implement role-based route protection (patient routes vs doctor routes)
6. Language selection screen (before consent): large flag/icon buttons for Hindi, English, (3rd language if ready)

**Components Affected:** Frontend, Backend, Database, Voice (TTS for consent)

**Definition of Done:**
- Patient can log in with a demo ABHA ID and mock OTP
- New patient can register
- Doctor can log in
- Consent screen displays with audio playback
- Consent stored in database
- Unauthorized users redirected to login

**Testing / Demo:** Walk through patient login → consent flow. Show consent record in DB.

**Complexity:** Medium

**Priority:** Critical

---

### Checkpoint 3 — Clinical Interview Engine (Core AI)

**Objective:** The heart of Module A — patient can have an AI-driven clinical interview via touch input. Voice comes in the next checkpoint. This checkpoint focuses on the conversation logic.

**Prerequisites:** Checkpoint 2

**Implementation Tasks:**
1. Create the clinical interview system prompt (`src/lib/ai/clinical-interview-prompt.ts`):
   - Encode the full clinical flow: Chief Complaint → HPI (SOCRATES/OLDCARTS) → PMH → Drug & Allergy → Family → Personal → ROS
   - Instruct Gemini to return structured JSON: `{next_question, options[], extracted_entities{}, red_flags[], section_complete, current_section, next_section}`
   - Include red-flag symptom combinations
   - Include instruction to adapt based on chief complaint
2. Create AYUSH interview system prompt (`src/lib/ai/ayush-interview-prompt.ts`):
   - Dashavidha Pariksha flow: Prakriti → Vikriti → Sara → ... → Ahara-Vihara
3. Create the AI service (`src/lib/ai/interview-service.ts`):
   - Function: `getNextQuestion(sessionId, patientInput, conversationHistory, currentSection)` → calls Gemini → parses JSON → returns structured response
   - Function: `checkRedFlags(extractedData)` → evaluates emergency patterns
4. Create the interview API endpoint (`/api/sessions/[id]/next`):
   - Receives patient input
   - Loads conversation history from DB
   - Calls AI service
   - Stores extracted entities in session
   - Returns next question + options
5. Create the interview UI (`/patient/interview`):
   - One question per screen
   - 3–4 large tap buttons for options
   - Free-text input field (for touch typing)
   - Progress indicator (which section: CC | HPI | PMH | ...)
   - Forward/back navigation
   - Red-flag alert screen (if triggered)
6. Create interview state management (Zustand store):
   - Current session ID
   - Current section
   - Conversation history
   - Extracted data so far
   - Red flags detected

**Components Affected:** Frontend, Backend, AI Layer

**Files Expected:**
- `src/lib/ai/clinical-interview-prompt.ts`
- `src/lib/ai/ayush-interview-prompt.ts`
- `src/lib/ai/interview-service.ts`
- `src/app/api/sessions/[id]/next/route.ts`
- `src/app/(patient)/interview/page.tsx`
- `src/components/patient/InterviewQuestion.tsx`
- `src/components/patient/OptionButton.tsx`
- `src/components/patient/ProgressBar.tsx`
- `src/components/patient/RedFlagAlert.tsx`
- `src/store/interview-store.ts`

**Definition of Done:**
- Patient can start an interview session
- AI asks adaptive questions based on chief complaint
- If patient says "chest pain" → AI follows SOCRATES framework
- Each question shows 3–4 tap options + free-text input
- Red flag combinations trigger an alert screen
- Session data (conversation history + extracted entities) persists in DB
- Interview completes after all sections (CC through ROS)
- AYUSH mode starts a Dashavidha Pariksha interview (can be separate flow)

**Testing / Demo:**
- Walk through a complete "chest pain" interview scenario
- Walk through a "headache" scenario (different SOCRATES questions)
- Trigger a red flag (acute chest pain + dyspnea + sweating)
- Show the extracted structured data in the DB

**Complexity:** High

**Priority:** Critical

---

### Checkpoint 4 — Voice / Multilingual Integration

**Objective:** Add voice input (ASR) and voice output (TTS) to the interview engine. Patient can now speak instead of tapping.

**Prerequisites:** Checkpoint 3

**Implementation Tasks:**
1. Create voice service wrapper (`src/lib/voice/speech-service.ts`):
   - `startListening(language)` → returns Promise<string> (transcribed text)
   - `speak(text, language)` → plays TTS audio
   - Implementation: Web Speech API first, with Bhashini API as optional enhancement
2. Create Bhashini API integration (if registered):
   - `src/lib/voice/bhashini-service.ts`
   - ASR endpoint call: send audio blob → get text
   - TTS endpoint call: send text → get audio
   - Language codes: `hi` (Hindi), `en` (English), `ta` (Tamil), etc.
3. Update interview UI to support voice:
   - Add microphone button (large, prominent) on every question screen
   - Show recording indicator (pulsing red dot)
   - Display transcribed text before submission (patient can confirm or re-record)
   - Auto-play TTS for each question (can be toggled off)
4. Language selection screen: patient taps their language → all subsequent TTS/ASR uses that language
5. Handle voice errors gracefully: if ASR fails, fall back to touch input with a message

**Components Affected:** Frontend, Voice Layer

**Files Expected:**
- `src/lib/voice/speech-service.ts`
- `src/lib/voice/bhashini-service.ts` (optional)
- `src/components/patient/VoiceButton.tsx`
- `src/components/patient/VoiceTranscript.tsx`
- Updated `InterviewQuestion.tsx` with voice integration

**Definition of Done:**
- Patient can tap the microphone and speak their answer in Hindi or English
- Transcribed text appears on screen for confirmation
- Each question is read aloud via TTS
- If ASR fails, patient can still use touch input
- Language selection persists through the entire session

**Testing / Demo:**
- Speak "mujhe sir mein dard ho raha hai" in Hindi → correct transcription → AI asks HPI questions
- Speak "I have chest pain" in English → correct transcription
- TTS reads questions aloud in selected language
- Demonstrate fallback to touch when voice fails

**Complexity:** Medium

**Priority:** Critical

---

### Checkpoint 5 — Medical Document Intelligence

**Objective:** Module B — patient can upload/photograph medical documents and the system extracts structured clinical data.

**Prerequisites:** Checkpoint 1 (database), Checkpoint 0 (Gemini API)

> **Note:** This checkpoint can be developed IN PARALLEL with Checkpoints 3 and 4 by a separate team member.

**Implementation Tasks:**
1. Create document upload UI (`/patient/documents`):
   - Camera capture button (large, with icon)
   - File upload button (for digital documents)
   - Preview of captured/uploaded image
   - List of uploaded documents with processing status
2. Create document processing service (`src/lib/ai/document-service.ts`):
   - Function: `processDocument(imageBuffer)` → calls Gemini Vision with the document analysis prompt → returns structured JSON
   - Prompt design: classify + OCR + entity extraction in one call
   - Parse response: document type, extracted text, medications, lab values, diagnoses, date, confidence
3. Create document API endpoints:
   - `POST /api/documents/upload` — upload image to Supabase Storage, create DB record
   - `POST /api/documents/[id]/process` — trigger Gemini Vision processing
   - `GET /api/documents/[id]/entities` — return extracted entities
4. Create document results display:
   - Show extracted entities (medications, lab values, diagnoses) in a structured card
   - Highlight abnormal lab values (red/orange badges)
   - Show confidence score per document
   - "Low confidence" warning for unclear documents
5. Create reference ranges constant file (`src/constants/lab-reference-ranges.ts`):
   - 20–30 common lab tests (CBC, LFT, RFT, lipid panel, HbA1c, thyroid, blood sugar, etc.) with normal ranges
6. Create basic drug interaction lookup (`src/constants/drug-interactions.ts`):
   - 20–30 common interactions (metformin + alcohol, warfarin + aspirin, etc.)

**Components Affected:** Frontend, Backend, AI Layer, Database

**Files Expected:**
- `src/lib/ai/document-service.ts`
- `src/lib/ai/document-analysis-prompt.ts`
- `src/app/api/documents/upload/route.ts`
- `src/app/api/documents/[id]/process/route.ts`
- `src/app/api/documents/[id]/entities/route.ts`
- `src/app/(patient)/documents/page.tsx`
- `src/components/patient/DocumentUpload.tsx`
- `src/components/patient/DocumentResults.tsx`
- `src/components/patient/AbnormalFlag.tsx`
- `src/constants/lab-reference-ranges.ts`
- `src/constants/drug-interactions.ts`

**Definition of Done:**
- Patient can photograph or upload a medical document
- Gemini Vision processes it and returns structured entities
- Extracted medications, lab values, diagnoses display in the UI
- Abnormal lab values are visually flagged
- Document type is correctly classified (prescription vs lab report vs discharge summary)
- Confidence score is shown; low-confidence documents are flagged
- Multiple documents can be uploaded per session

**Testing / Demo:**
- Upload a printed prescription image → extracted medications shown
- Upload a lab report image → values extracted with abnormal flags
- Upload a discharge summary → diagnoses extracted
- Upload a blurry/handwritten document → low confidence warning

**Complexity:** High

**Priority:** Critical

---

### Checkpoint 6 — Clinical Summary Generation

**Objective:** Module C — generate the structured, physician-ready clinical summary from the interview data + document data.

**Prerequisites:** Checkpoint 3 (interview data exists), Checkpoint 5 (document data exists)

**Implementation Tasks:**
1. Create summary generation service (`src/lib/ai/summary-service.ts`):
   - Function: `generateSummary(sessionId)` → loads all extracted data from interview + documents → calls Gemini with summarization prompt → returns structured summary JSON
   - Summary prompt: compile into standard clinical format (CC, HPI, PMH, Drugs, Allergies, Family, Personal, ROS, Prior Investigations, Flags)
2. Create summary API:
   - `POST /api/summary/[sessionId]/generate` — trigger summary generation
   - `GET /api/summary/[sessionId]` — get generated summary
3. Create patient summary confirmation screen (`/patient/summary`):
   - Display the summary in patient-readable format
   - TTS reads it aloud in patient's language for confirmation
   - "Confirm & Submit" button → marks session as completed → pushes to doctor queue
4. Create summary data model updates (session.summary JSON field)

**Components Affected:** Backend, AI Layer, Frontend

**Files Expected:**
- `src/lib/ai/summary-service.ts`
- `src/lib/ai/summary-prompt.ts`
- `src/app/api/summary/[sessionId]/generate/route.ts`
- `src/app/api/summary/[sessionId]/route.ts`
- `src/app/(patient)/summary/page.tsx`
- `src/components/patient/SummaryView.tsx`
- `src/components/patient/SummarySection.tsx`

**Definition of Done:**
- After interview + document upload, patient can trigger summary generation
- Summary contains all clinical sections in the correct format
- Summary includes data from both interview AND scanned documents
- Flags section shows red flags + abnormal values + drug interactions
- Patient hears summary read aloud and can confirm
- Confirmed session appears in doctor's queue

**Testing / Demo:**
- Complete a full patient flow (interview + 2 documents) → generate summary → show the output matches the Module C format from the solution document
- Verify that document-extracted data (prior medications, lab values) appears in the summary

**Complexity:** Medium

**Priority:** Critical

---

### Checkpoint 7 — Doctor Dashboard

**Objective:** Doctors can log in, view their patient queue, see complete clinical summaries, edit, and confirm/reject.

**Prerequisites:** Checkpoint 6 (summaries exist)

**Implementation Tasks:**
1. Create doctor queue page (`/doctor/dashboard`):
   - List of patients with completed intake sessions
   - Status badges: "Ready for Review" / "In Progress" / "Confirmed"
   - Token/queue number
   - Click → opens summary
2. Create summary view for doctors (`/doctor/patient/[sessionId]`):
   - Full structured clinical summary (identical to Module C output format)
   - Flags panel (red flags, abnormal values, drug interactions) — prominently displayed
   - Medical timeline (documents ordered by date)
   - Inline editing: click on any section → edit the text → save
   - Buttons: ✅ Confirm | ✏️ Edit | ❌ Reject
3. Create doctor API endpoints:
   - `GET /api/doctor/queue` — get list of ready sessions for this doctor's department
   - `GET /api/doctor/patients/[sessionId]/summary` — get full summary
   - `PUT /api/summary/[sessionId]/edit` — save doctor's edits
   - `POST /api/summary/[sessionId]/confirm` — doctor confirms
   - `POST /api/summary/[sessionId]/reject` — doctor rejects with reason
4. Create post-consultation section (basic):
   - After confirming, doctor can add notes/prescriptions (text field)
   - This is stored as part of the session record
5. FHIR export button (links to Checkpoint 8):
   - "View FHIR" button → shows raw FHIR JSON bundle in a modal/panel

**Components Affected:** Frontend (doctor), Backend

**Files Expected:**
- `src/app/(doctor)/dashboard/page.tsx`
- `src/app/(doctor)/patient/[sessionId]/page.tsx`
- `src/components/doctor/PatientQueue.tsx`
- `src/components/doctor/ClinicalSummary.tsx`
- `src/components/doctor/FlagsPanel.tsx`
- `src/components/doctor/SummaryEditor.tsx`
- `src/components/doctor/MedicalTimeline.tsx`
- `src/app/api/doctor/queue/route.ts`
- `src/app/api/doctor/patients/[sessionId]/summary/route.ts`

**Definition of Done:**
- Doctor logs in and sees a queue of patients with completed intake
- Clicking a patient shows the full structured clinical summary
- Red flags and abnormal values are prominently highlighted
- Doctor can edit any section inline
- Doctor can confirm or reject the summary
- Confirmed status persists in DB

**Testing / Demo:**
- Log in as doctor → see 3 demo patients in queue → open one → review summary → edit a field → confirm
- Show a red-flag patient highlighted differently in the queue

**Complexity:** Medium

**Priority:** Critical

---

### Checkpoint 8 — FHIR Resource Generation

**Objective:** Generate valid FHIR R4 JSON resources from clinical data. Show interoperability readiness.

**Prerequisites:** Checkpoint 6 (clinical data exists)

**Implementation Tasks:**
1. Create FHIR resource builders (`src/lib/fhir/`):
   - `patient-resource.ts` — maps Patient model → FHIR Patient resource
   - `composition-resource.ts` — maps clinical summary → FHIR Composition
   - `condition-resource.ts` — maps diagnoses → FHIR Condition resources
   - `medication-statement-resource.ts` — maps medications → FHIR MedicationStatement
   - `allergy-intolerance-resource.ts` — maps allergies → FHIR AllergyIntolerance
   - `observation-resource.ts` — maps lab values → FHIR Observation
   - `document-reference-resource.ts` — maps uploaded documents → FHIR DocumentReference
   - `bundle-builder.ts` — wraps all resources into a FHIR Bundle
2. Create FHIR API endpoint:
   - `GET /api/fhir/bundle/[sessionId]` — returns complete FHIR Bundle JSON
3. Add "View FHIR Bundle" to doctor dashboard:
   - Button that opens a panel/modal with formatted FHIR JSON
   - "Copy JSON" button
4. Create FHIR type definitions (`src/types/fhir.ts`):
   - TypeScript interfaces for Patient, Composition, Condition, etc.

**Components Affected:** Backend (FHIR module), Frontend (doctor dashboard)

**Files Expected:**
- `src/lib/fhir/patient-resource.ts`
- `src/lib/fhir/composition-resource.ts`
- `src/lib/fhir/condition-resource.ts`
- `src/lib/fhir/medication-statement-resource.ts`
- `src/lib/fhir/allergy-intolerance-resource.ts`
- `src/lib/fhir/observation-resource.ts`
- `src/lib/fhir/document-reference-resource.ts`
- `src/lib/fhir/bundle-builder.ts`
- `src/types/fhir.ts`
- `src/app/api/fhir/bundle/[sessionId]/route.ts`

**Definition of Done:**
- FHIR Patient resource generated with correct structure
- FHIR Composition contains the clinical summary text
- FHIR Bundle wraps all resources for a patient encounter
- JSON matches FHIR R4 specification (correct resourceType, structure, references)
- Doctor dashboard shows "View FHIR" button with formatted JSON

**Testing / Demo:**
- Generate FHIR bundle for a completed session → show the JSON → explain each resource to judges
- Paste the JSON into a FHIR validator (https://validator.fhir.org/) to show structural validity

**Complexity:** Medium

**Priority:** Important

---

### Checkpoint 9 — ABDM Mock Integration

**Objective:** Demonstrate the ABDM integration architecture with a mock service that follows the real API contract.

**Prerequisites:** Checkpoint 8 (FHIR bundle exists)

**Implementation Tasks:**
1. Create ABDM mock service (`src/lib/abdm/mock-abdm-service.ts`):
   - `verifyAbha(abhaId)` → returns mock patient details if ID matches demo data
   - `pushHealthInfo(fhirBundle)` → logs the bundle, returns success response with transaction ID
   - `pullHealthInfo(abhaId)` → returns pre-loaded demo health records
2. Create ABDM API routes:
   - `POST /api/abdm/verify-abha` — verify ABHA ID
   - `POST /api/abdm/push` — push FHIR bundle to "ABDM"
   - `GET /api/abdm/pull/[abhaId]` — pull prior records
3. Integrate into patient flow:
   - After summary confirmation → auto-trigger ABDM push → show "✅ Linked to ABHA record"
4. Integrate into doctor dashboard:
   - "Pull ABDM Records" button → shows prior records from mock HIU

**Components Affected:** Backend (ABDM module), Frontend

**Files Expected:**
- `src/lib/abdm/mock-abdm-service.ts`
- `src/lib/abdm/types.ts`
- `src/app/api/abdm/verify-abha/route.ts`
- `src/app/api/abdm/push/route.ts`
- `src/app/api/abdm/pull/[abhaId]/route.ts`

**Definition of Done:**
- ABHA ID verification works with demo IDs
- FHIR bundle successfully "pushed" to mock ABDM (logged + success response)
- Prior records "pulled" from mock ABDM and displayed
- UI shows ABDM integration status (✅ Linked / ⏳ Pending)

**Testing / Demo:**
- Use demo ABHA ID → verify → complete intake → summary pushed → show "Linked to ABHA"
- Show the mock ABDM service logs — real FHIR bundles being sent

**Complexity:** Low

**Priority:** Important

---

### Checkpoint 10 — Security, Consent & Audit

**Objective:** Harden the security layer. Show consent enforcement, session purge, and audit trail.

**Prerequisites:** Checkpoint 2 (auth exists), Checkpoint 6 (sessions exist)

**Implementation Tasks:**
1. Enforce consent checks in all data-capture APIs:
   - Before any interview/document API call, verify active consent exists
   - Return 403 if no consent
2. Implement session data purge:
   - After summary is confirmed, delete raw voice recordings and original document images from storage
   - Keep only structured data + summary
   - API: `POST /api/sessions/[id]/purge`
3. Create basic audit log table and logging:
   - Log: who accessed what data, when, action type (view/edit/confirm/purge)
   - Display on admin/doctor page: "Audit Trail" section
4. Add TLS indicator in UI (show lock icon — Vercel handles HTTPS automatically)
5. Sanitize all API inputs (prevent injection)

**Components Affected:** Backend, Database

**Definition of Done:**
- API returns 403 if consent is missing
- After session purge, raw files are deleted from storage
- Audit log records all data access events
- Doctor can view audit trail for a patient session

**Testing / Demo:**
- Try to access interview API without consent → 403 error
- Complete a session → purge → verify raw files deleted
- Show audit log entries

**Complexity:** Medium

**Priority:** Important

---

### Checkpoint 11 — PWA & Offline Basics

**Objective:** Make the app installable as a PWA and show basic offline capability.

**Prerequisites:** Checkpoint 2 (frontend exists)

**Implementation Tasks:**
1. Add PWA manifest (`public/manifest.json`):
   - Name, icons, theme color, start URL, display: standalone
2. Add Service Worker (next-pwa or Serwist):
   - Cache static assets (JS, CSS, images, icons)
   - Cache the interview UI shell
3. Add "Install App" prompt on the landing page
4. Test: turn off network → app shell loads → show "You're offline" message with cached UI

**Components Affected:** Frontend, Infrastructure

**Definition of Done:**
- App is installable (Chrome shows "Install" prompt)
- App shell loads without network
- Offline state shows appropriate message

**Testing / Demo:**
- Install the PWA on a phone/tablet → show it loads from home screen
- Turn off WiFi → app shell still renders

**Complexity:** Low

**Priority:** Important

---

### Checkpoint 12 — AYUSH Mode & Insurance Module

**Objective:** Add AYUSH-specific interview mode and insurance/mediclaim display. These are "should have" differentiators.

**Prerequisites:** Checkpoint 3 (interview engine), Checkpoint 1 (DB)

**Implementation Tasks:**
1. AYUSH mode:
   - Add mode selection at interview start: "Allopathic OPD" or "Ayurvedic OPD"
   - If AYUSH → use the Dashavidha Pariksha system prompt
   - AYUSH summary section added to the clinical summary output
2. Insurance display:
   - Patient profile shows linked insurance policies (from seed data)
   - Cooldown/waiting period status
   - Doctor dashboard shows insurance verification panel

**Components Affected:** Frontend, Backend, AI Layer

**Definition of Done:**
- Patient can choose AYUSH mode → interview covers Prakriti, Vikriti, Agni, etc.
- AYUSH summary appears as an additional section in the clinical summary
- Insurance info displays on patient profile and doctor dashboard

**Testing / Demo:**
- Walk through an AYUSH interview → show Dashavidha Pariksha assessment in summary
- Show insurance panel on doctor dashboard

**Complexity:** Medium

**Priority:** Important (differentiator)

---

### Checkpoint 13 — End-to-End Integration & Demo Data

**Objective:** Wire everything together. Create polished demo scenarios. Verify the complete flow works end-to-end.

**Prerequisites:** All previous checkpoints

**Implementation Tasks:**
1. Create 5 complete demo scenarios with seed data:
   - **Scenario 1:** Chest pain patient (triggers red flag, has prior cardiac history in documents)
   - **Scenario 2:** Diabetes follow-up (HbA1c trend from scanned reports)
   - **Scenario 3:** Elderly Hindi-speaking patient (voice-only interaction)
   - **Scenario 4:** AYUSH patient (Dashavidha Pariksha)
   - **Scenario 5:** Emergency accident patient (instant history lookup via ABHA)
2. Prepare sample document images for demo:
   - 2 printed prescriptions
   - 2 lab reports (one with abnormal values)
   - 1 discharge summary
3. End-to-end flow testing:
   - Patient login → consent → interview → document upload → summary → doctor review → FHIR export → ABDM push
4. Fix any integration bugs between modules
5. Add loading states, error states, and edge case handling

**Components Affected:** All

**Definition of Done:**
- All 5 demo scenarios work end-to-end without errors
- Data flows correctly from patient intake through to doctor dashboard
- FHIR bundle generates correctly for each scenario
- No crashes, no unhandled errors in the demo flow

**Testing / Demo:** Run all 5 scenarios end-to-end. Record screen capture of each.

**Complexity:** Medium

**Priority:** Critical

---

### Checkpoint 14 — SIH Demo Hardening

**Objective:** Polish the UI, prepare the presentation, handle edge cases, create the demo script.

**Prerequisites:** Checkpoint 13

**Implementation Tasks:**
1. UI polish:
   - Consistent styling across all screens
   - Large, accessible touch targets (verify 48×48dp minimum)
   - Color-coded sections in clinical summary
   - Smooth transitions between screens
   - Loading spinners for AI processing
   - Error messages that are user-friendly
2. Create demo script document:
   - Exact sequence of actions for the live demo
   - Which scenarios to show
   - Talking points for each screen
   - Backup plan if voice/AI fails during demo
3. Prepare fallback mechanisms:
   - If Gemini API is slow → show pre-cached response
   - If voice fails → switch to touch seamlessly
   - If document OCR fails → show the confidence-flagging behavior
4. Performance optimization:
   - Optimize image uploads (compress before sending)
   - Reduce API response times where possible
5. Add "About SwasthaSetu" page with:
   - Architecture diagram
   - Tech stack
   - Team info
   - Impact metrics

**Components Affected:** All (polish)

**Definition of Done:**
- Demo flows smoothly without any UI glitches
- Fallback mechanisms work
- Demo script is written and rehearsed
- All team members can run the demo
- Loading times are acceptable (< 5 seconds per AI call)

**Testing / Demo:** Full rehearsal of the SIH demo with timer. Target: complete in 10–15 minutes.

**Complexity:** Medium

**Priority:** Critical

---

### Checkpoint 15 — Final SIH Presentation & Evaluation

**Objective:** Final checks, deployment verification, presentation preparation.

**Prerequisites:** Checkpoint 14

**Implementation Tasks:**
1. Verify production deployment on Vercel works
2. Test on multiple devices (phone, tablet, laptop)
3. Prepare presentation slides covering:
   - Problem statement
   - Solution overview
   - Architecture diagram
   - Live demo
   - Technology choices
   - FHIR/ABDM integration approach
   - Impact and metrics
   - Future roadmap
4. Prepare for judge Q&A:
   - "How does this handle privacy?" → DPDP Act compliance, consent-first, session purge
   - "Is this a real ABDM integration?" → "Mock integration following real API contracts; production integration requires NHA registration"
   - "What about handwritten prescriptions?" → "Tiered OCR with confidence scoring; low confidence flagged for review"
   - "How accurate is the AI?" → "We use Gemini 2.0 Flash with structured clinical prompts. Summary is always a draft that the physician edits/confirms."

**Components Affected:** None (documentation + presentation)

**Definition of Done:**
- App deployed and accessible via public URL
- Presentation slides complete
- Team rehearsed the demo
- Q&A preparation complete

**Complexity:** Low

**Priority:** Critical

---

## 6. DEVELOPMENT STRATEGY

### Critical Path

```
Checkpoint 0 (Foundation)
    │
    ▼
Checkpoint 1 (Database + Backend)
    │
    ├──────────────────────────────────┐
    ▼                                  ▼
Checkpoint 2 (Auth + Onboarding)   Checkpoint 5 (Document Intelligence)
    │                                  │        [PARALLEL TRACK]
    ▼                                  │
Checkpoint 3 (Clinical Interview)      │
    │                                  │
    ▼                                  │
Checkpoint 4 (Voice Integration)       │
    │                                  │
    └──────────────┬───────────────────┘
                   │
                   ▼
           Checkpoint 6 (Summary Generation)
                   │
                   ▼
           Checkpoint 7 (Doctor Dashboard)
                   │
            ┌──────┼──────┐
            ▼      ▼      ▼
           CP8   CP9    CP10         [PARALLEL]
          (FHIR) (ABDM) (Security)
            │      │      │
            └──────┼──────┘
                   ▼
           Checkpoint 11 (PWA)
                   │
                   ▼
           Checkpoint 12 (AYUSH + Insurance)
                   │
                   ▼
           Checkpoint 13 (End-to-End Integration)
                   │
                   ▼
           Checkpoint 14 (Demo Hardening)
                   │
                   ▼
           Checkpoint 15 (Final Presentation)
```

### Parallel Workstreams (for a 4–5 person team)

| Workstream | Owner | Checkpoints | Focus |
|------------|-------|-------------|-------|
| **A — Frontend + UX** | Dev 1 | CP0, CP2 (UI), CP3 (interview UI), CP4 (voice UI), CP7 (doctor UI), CP11, CP14 | All patient + doctor screens, accessibility, PWA |
| **B — Backend + Database** | Dev 2 | CP0, CP1, CP2 (API), CP3 (API), CP7 (API), CP10 | Schema, APIs, auth, session management, security |
| **C — AI + ML** | Dev 3 | CP3 (prompts + AI service), CP4 (Bhashini), CP5 (document AI), CP6 (summary AI) | All Gemini prompts, interview logic, OCR pipeline, summary generation |
| **D — Integrations** | Dev 4 | CP8 (FHIR), CP9 (ABDM), CP12 (AYUSH + insurance) | FHIR resources, ABDM mock, AYUSH prompts, insurance data |
| **E — Demo + QA** | Dev 5 (or shared) | CP13, CP14, CP15 | Integration testing, demo data, demo script, presentation |

### High-Risk Components

| Component | Risk | Mitigation |
|-----------|------|-----------|
| **Gemini clinical interview quality** | LLM may not follow clinical flow perfectly, may hallucinate sections | Extensive prompt engineering + structured JSON output mode + manual testing of 5+ scenarios |
| **Voice recognition accuracy (Hindi)** | Web Speech API Hindi accuracy may be poor in noisy environments | Always offer touch fallback; Bhashini API as backup; for demo, use a quiet room |
| **Document OCR accuracy** | Gemini Vision may misread handwritten docs | Use printed documents for demo; show confidence-flagging for low-quality scans; prepare a fallback with pre-processed results |
| **End-to-end data flow** | Data might not propagate correctly across interview → documents → summary → FHIR | Early integration testing in CP13; don't leave integration to the last day |

### Mock Services to Create Early

| Mock | When | Why |
|------|------|-----|
| ABDM verification + push/pull | Checkpoint 1 | Don't block development on real ABDM access |
| NMC provider verification | Checkpoint 1 | Hardcoded demo doctors |
| Aadhaar OTP | Checkpoint 2 | Hardcoded OTP (123456) |
| Drug interaction database | Checkpoint 5 | Small hardcoded lookup (20 interactions) |
| Lab reference ranges | Checkpoint 5 | Hardcoded for 25 common tests |

### Demo Data to Prepare

| Data | Description |
|------|-------------|
| 5 demo patients | With varying conditions: cardiac, diabetic, elderly, AYUSH, accident |
| 2 demo doctors | One allopathic, one AYUSH |
| 5 sample document images | Printed prescriptions, lab reports, discharge summary |
| 3 demo insurance policies | Active policy, policy in waiting period, expired policy |
| Demo ABHA IDs | 5 hardcoded IDs that work with the mock ABDM service |

### What NOT to Attempt Early

- Real ABDM sandbox registration (takes weeks — mock it from day 1)
- Fine-tuning an LLM (use prompt engineering on Gemini Flash — it's sufficient)
- Custom handwriting OCR model training (use Gemini Vision + confidence scoring)
- Full 8-language support (start with Hindi + English, add a 3rd if time permits)
- Kiosk hardware integration (demo on a tablet in a browser)
- Hospital HIS/EMR integration (mock the push endpoint)

---

## 7. ESTIMATED TIMELINE

Assuming a team of 4–5 developers working intensively:

| Phase | Checkpoints | Duration |
|-------|-------------|----------|
| Foundation | CP0 + CP1 | Days 1–2 |
| Core patient flow | CP2 + CP3 + CP4 | Days 3–6 |
| Document + Summary | CP5 + CP6 (parallel with CP3/4) | Days 3–6 |
| Doctor + Interop | CP7 + CP8 + CP9 | Days 7–9 |
| Polish | CP10 + CP11 + CP12 | Days 10–11 |
| Integration + Demo | CP13 + CP14 + CP15 | Days 12–14 |

**Total: ~14 intensive development days (2 weeks)**

---

*This implementation plan is a living document. It will be updated as development progresses.*
