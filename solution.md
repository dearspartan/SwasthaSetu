# SwasthaSetu — AI-Powered Clinical History & Document Intake Platform

> **One-liner:** A patient-facing software platform that conducts a structured clinical history interview via voice and touch, digitizes legacy medical documents, and delivers a physician-ready summary to the hospital system — all before the patient enters the consultation room.

---

## 1. Problem Summary

| Dimension | Current Reality |
|-----------|----------------|
| **Consultation time** | 2–5 minutes per OPD patient (BMJ Open, 2017) — among the shortest globally |
| **Patient volume** | Tertiary government hospitals register 4,000–10,000 OPD patients/day |
| **History-taking yield** | A thorough history yields the correct diagnosis in 70–80% of cases — but there is no time to take one |
| **Records** | Patients carry loose paper prescriptions, lab reports, discharge summaries — handwritten, multilingual, unorganized |
| **AYUSH gap** | Ayurvedic intake (Dashavidha Pariksha) is far more extensive than allopathic history — impossible to complete manually in OPD time |
| **Digital infra** | ABDM provides ABHA IDs, FHIR APIs, HIE — but the "first-mile" patient intake layer is missing |

**Result:** Systematic under-elicitation of history, missed comorbidities, diagnostic error, and repeated questioning across visits.

---

## 2. Why Existing Solutions Fail

| Existing Approach | Why It Falls Short |
|-------------------|--------------------|
| Hospital registration systems | Capture only demographics (name, age, token). Zero clinical history. |
| Mobile health apps / tele-triage bots | Require smartphone literacy, stable connectivity, pre-enrollment — exclude elderly, rural, low-literacy patients |
| Nurse-led triage desks | Human-resource-limited, don't scale to 5,000+ daily patients, reintroduce the same bottleneck |
| Generic document scanners | Digitize images but don't extract, structure, or link clinical content to patient records |
| Existing EHR/EMR systems | Doctor-side data entry *after* the consultation — doesn't solve the pre-consultation history gap |

---

## 3. Solution Overview

**SwasthaSetu** is a software platform that enables any patient — regardless of literacy, language, or digital comfort — to independently complete a comprehensive clinical history and document intake before seeing the doctor.

### Core Capabilities

```
┌─────────────────────────────────────────────────────────────┐
│                     SwasthaSetu Platform                      │
├──────────────┬──────────────┬───────────────┬───────────────┤
│  Module A    │  Module B    │  Module C     │  Module D     │
│  AI Clinical │  Document    │  Structured   │  Consent,     │
│  History     │  Digitization│  Summary      │  Privacy &    │
│  Engine      │  & Intel     │  Generator    │  ABDM Layer   │
├──────────────┼──────────────┼───────────────┼───────────────┤
│              │              │               │               │
│ Voice + Touch│ Scan/Upload  │ Physician-    │ ABHA Auth     │
│ Interview    │ OCR + Extract│ ready Summary │ FHIR Push     │
│ Multilingual │ Timeline     │ Editable Draft│ DPDP Consent  │
│ Adaptive Q's │ Flag Abnorms │ Bilingual     │ Session Purge │
│ AYUSH Mode   │ Drug Alerts  │               │               │
│ Red Flags    │              │               │               │
└──────────────┴──────────────┴───────────────┴───────────────┘
```

### Additional Platform Features (Original Differentiators)

| Feature | Purpose |
|---------|---------|
| **Online + Offline Sync** | Portal works offline in low-connectivity hospital environments; syncs to server when connection is restored |
| **Verified Provider Gating** | Only verified doctors/clinics/hospitals can add medical checkup data — ensures data credibility |
| **Provider Adoption Incentive** | Patients prefer verified providers whose records appear on the portal → drives organic adoption |
| **Insurance / Mediclaim Visibility** | All insurance policies visible with cooldown/waiting period status; private hospitals can instantly verify coverage |
| **Regular Medication Tracker** | Chronic condition medications (Thyroid, Diabetes, BP, etc.) tracked persistently across visits |
| **Emergency Fast-Track** | Accident/emergency patients processed faster — history instantly available via ABHA lookup |

---

## 4. Module-by-Module Design

### Module A — Conversational Multimodal History Engine

A medically fine-tuned LLM conducts a structured clinical interview with the patient through voice and touch, in their preferred language.

#### How It Works

1. **Patient speaks naturally** in their language (e.g., "मुझे सीने में दर्द हो रहा है" / "I have chest pain")
2. **ASR converts speech to text** using Indian-language speech recognition (Bhashini / AI4Bharat)
3. **LLM asks intelligent follow-up questions** using clinical reasoning frameworks:
   - **SOCRATES** for pain: Site, Onset, Character, Radiation, Associated symptoms, Time, Exacerbating/relieving factors, Severity
   - **OLDCARTS** for general complaints: Onset, Location, Duration, Character, Aggravating factors, Relieving factors, Timing, Severity
4. **Dual-mode input at every step:** patient can answer by speaking OR by tapping a multiple-choice option on screen — no question is voice-only or touch-only
5. **Audio prompts (TTS)** guide the patient through each step in their language

#### Structured Clinical Interview Flow

```
START
  │
  ├── Language Selection (voice or tap)
  │
  ├── Chief Complaint
  │     └── Adaptive deep-dive (SOCRATES / OLDCARTS)
  │
  ├── History of Present Illness (HPI)
  │     └── Timeline, progression, associated symptoms
  │
  ├── Past Medical History
  │     └── Chronic diseases, hospitalizations, surgeries
  │
  ├── Drug & Allergy History
  │     └── Current medications, known allergies, adverse reactions
  │
  ├── Family History
  │     └── Hereditary conditions, first-degree relative diseases
  │
  ├── Personal History
  │     └── Smoking, alcohol, diet, occupation, sleep
  │
  ├── Review of Systems (ROS)
  │     └── Systematic organ-system checklist
  │
  ├── Regular Medications Tracker
  │     └── Thyroid, Diabetes (Sugar), Hypertension (BP), etc.
  │
  └── 🚨 RED-FLAG CHECK (runs continuously)
        └── Emergency symptoms detected?
              ├── YES → Immediate priority alert to triage staff
              └── NO  → Continue to Module B
```

#### Red-Flag Detection Examples

| Detected Pattern | Action |
|-----------------|--------|
| Acute chest pain + dyspnea + sweating | → **STEMI alert** — bypass queue, alert cardiology triage |
| Sudden weakness one side + speech difficulty | → **Stroke alert** — alert neurology triage |
| Severe abdominal pain + rigidity | → **Acute abdomen alert** — alert surgical triage |
| Suicidal ideation mentioned | → **Psychiatric emergency** — alert psychiatry + counselor |

#### AYUSH History Mode (Dedicated)

For Ayurvedic OPDs, the interview switches to an **active Dashavidha Pariksha assessment** — not a passive display, but an AI-guided interview:

| Pariksha Parameter | What the AI Assesses |
|--------------------|---------------------|
| **Prakriti** (Constitution) | Vata / Pitta / Kapha dominance through structured questions on body type, temperament, preferences |
| **Vikriti** (Current Imbalance) | Present dosha aggravation based on current symptoms |
| **Sara** (Tissue Essence) | Quality of dhatus — skin, muscle, bone assessment questions |
| **Samhanana** (Body Build) | Compactness, frame, build |
| **Pramana** (Proportions) | Height, weight, proportional assessment |
| **Satmya** (Adaptability) | Tolerance to foods, seasons, environments |
| **Sattva** (Mental Resilience) | Psychological strength, stress response, emotional patterns |
| **Ahara Shakti** (Digestive Capacity) | Appetite, digestion quality, Agni assessment |
| **Vyayama Shakti** (Exercise Capacity) | Physical endurance, exercise habits |
| **Vaya** (Age-related assessment) | Age-appropriate health parameters |
| **Agni** (Digestive Fire) | Sama / Vishama / Tikshna / Manda classification |
| **Koshtha** (Bowel Nature) | Krura / Mrudu / Madhyama |
| **Ahara-Vihara** (Diet & Lifestyle) | Detailed dietary habits, daily routine, sleep patterns |
| **Nidana** (Causative Factors) | Identified causative and triggering factors |
| **Samprapti** (Pathogenesis) | Disease progression pathway |

**Output:** A structured Ayurvedic assessment summary alongside the standard allopathic history, giving the Vaidya a complete patient profile.

---

### Module B — Medical Document Digitization & Intelligence

An integrated scanning and document-AI pipeline that digitizes the patient's existing physical medical records.

#### Workflow

```
Patient uploads/scans documents
         │
         ▼
  ┌──────────────┐
  │  Document     │
  │  Classification│ ← Prescription / Lab Report / Discharge Summary / Imaging
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  OCR Engine   │
  │  (Tiered)     │
  │               │
  │  Tier 1: Printed text → Standard OCR (high accuracy)
  │  Tier 2: Handwritten → Specialized handwriting recognition models
  │  Tier 3: Unreadable → Flagged for manual review by data-entry staff
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  Clinical     │
  │  Entity       │ ← Extracts: Diagnoses, Medications + Dosages,
  │  Extraction   │   Lab Values + Reference Ranges, Procedures/Surgeries
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │  Intelligence │
  │  Layer        │
  │               │
  │  • Chronological Timeline — auto-date and order all documents
  │  • Abnormal Value Highlighting — flag out-of-range lab results
  │  • Drug Interaction Alerts — flag potential medication conflicts
  │  • Duplicate Detection — identify repeat tests/prescriptions
  └──────────────┘
```

#### Document Types Handled

| Document Type | What's Extracted |
|---------------|-----------------|
| **Prescriptions** | Medications, dosages, frequency, prescribing doctor, date |
| **Lab Reports** | Test names, values, reference ranges, abnormal flags |
| **Discharge Summaries** | Diagnoses (ICD-coded), procedures, medications at discharge, follow-up instructions |
| **Imaging Reports** | Modality, findings, impressions |
| **Surgical Records** | Procedure name, date, surgeon, anesthesia type, complications |

#### Handling the Handwriting Problem

- **Honest reality:** Handwritten prescriptions in India are notoriously illegible. Perfect OCR is not achievable today.
- **Our approach:**
  - Use specialized handwriting recognition models (Google Vision AI / custom-trained on Indian medical handwriting datasets)
  - Confidence scoring — if OCR confidence < threshold, flag for manual review rather than hallucinating text
  - Prefer digital documents where available (e-prescriptions, digital lab reports)
  - Prompt verified providers on the platform to upload digital reports directly, bypassing OCR entirely

---

### Module C — Structured History Summary Generator

An AI summarization engine that synthesizes the conversational history (Module A) and the digitized documents (Module B) into a **single, concise, physician-ready clinical summary**.

#### Output Format

```
┌──────────────────────────────────────────────────┐
│         CLINICAL HISTORY SUMMARY                 │
│         Patient: [Name] | ABHA: [ID]             │
│         Date: [Date] | Language: [Lang]           │
│         Department: [Dept] | Token: [#]           │
├──────────────────────────────────────────────────┤
│                                                  │
│  CHIEF COMPLAINT                                 │
│  "Chest pain for 3 days, worsening on exertion"  │
│                                                  │
│  HISTORY OF PRESENT ILLNESS                      │
│  • Onset: 3 days ago, gradual                    │
│  • Character: Squeezing, retrosternal            │
│  • Radiation: Left arm                           │
│  • Aggravating: Exertion, climbing stairs        │
│  • Relieving: Rest                               │
│  • Associated: Mild dyspnea, no diaphoresis      │
│  • Severity: 6/10                                │
│                                                  │
│  PAST MEDICAL HISTORY                            │
│  • Type 2 Diabetes Mellitus (2018)               │
│  • Hypertension (2020)                           │
│  • No prior surgeries                            │
│                                                  │
│  DRUG & ALLERGY HISTORY                          │
│  Current Medications:                            │
│  • Tab Metformin 500mg BD                        │
│  • Tab Amlodipine 5mg OD                         │
│  Allergies: Sulfonamides (rash)                  │
│                                                  │
│  FAMILY HISTORY                                  │
│  • Father: MI at age 55                          │
│  • Mother: Type 2 DM                             │
│                                                  │
│  PERSONAL HISTORY                                │
│  • Non-smoker, occasional alcohol                │
│  • Sedentary occupation (desk job)               │
│                                                  │
│  REVIEW OF SYSTEMS                               │
│  • CVS: Chest pain (as above), no palpitations   │
│  • Resp: Mild exertional dyspnea                 │
│  • GIT: Normal                                   │
│  • CNS: No headache, no dizziness                │
│                                                  │
│  PRIOR INVESTIGATIONS (from scanned documents)   │
│  • HbA1c: 7.8% (3 months ago) ⚠️ ABOVE RANGE   │
│  • Lipid Profile: LDL 165 mg/dL ⚠️ ABOVE RANGE │
│  • ECG (6 months ago): Normal sinus rhythm       │
│                                                  │
│  ⚠️ FLAGS                                        │
│  • Possible drug interaction: None detected      │
│  • Abnormal values: HbA1c, LDL elevated          │
│  • Red flags: Exertional chest pain + family h/o │
│    MI → consider urgent cardiac workup           │
│                                                  │
│  [For AYUSH OPD: Dashavidha Pariksha summary     │
│   would appear here as additional section]       │
│                                                  │
├──────────────────────────────────────────────────┤
│  ✏️ PHYSICIAN: Edit / Confirm / Reject           │
│  This is an AI-generated DRAFT — not a diagnosis │
└──────────────────────────────────────────────────┘
```

#### Key Properties

| Property | Detail |
|----------|--------|
| **Editable** | Physician retains full control — accept, amend, or reject any section. The summary is a draft, never an autonomous diagnosis. |
| **Bilingual** | Patient receives audio confirmation of captured history in their local language. Physician sees the summary in English/Hindi. |
| **Pushed to doctor's screen** | Summary appears on the consultation terminal the moment the patient's token is called — zero manual retrieval. |
| **FHIR-structured** | Summary is stored as FHIR resources (Composition, Condition, MedicationStatement, AllergyIntolerance, Observation) for interoperability. |

---

### Module D — Consent, Privacy & ABDM Integration

A robust consent and security layer compliant with Indian law and the ABDM framework.

#### Authentication

```
Patient arrives
     │
     ├── Has ABHA ID? ──YES──→ Scan ABHA QR / Enter ABHA number
     │                              │
     │                              └── OTP verification (Aadhaar-linked mobile)
     │
     └── No ABHA ID? ──→ Assisted ABHA creation (Aadhaar OTP flow)
                              │
                              └── New ABHA ID issued → proceed
```

#### Consent Framework

| Requirement | Implementation |
|-------------|---------------|
| **Granular consent** | Patient chooses what data to capture (history, documents, or both) and who to share with (this hospital, ABHA record, or both) |
| **Audio-explained consent** | Every consent screen has a "🔊 Listen" button — full consent terms read aloud in patient's language for low-literacy users |
| **Revocable** | Patient can revoke consent at any time through the portal; shared data is withdrawn from HIE |
| **Session data purge** | All temporary session data (voice recordings, raw scans) is purged immediately after the structured summary is generated and confirmed |
| **DPDP Act 2023 compliance** | Purpose limitation, data minimization, storage limitation, and data principal rights fully implemented |
| **Encryption** | Data encrypted in transit (TLS 1.3) and at rest (AES-256) |

#### ABDM Integration Architecture

```
SwasthaSetu Platform
       │
       ├──→ ABHA Authentication (M1 APIs)
       │
       ├──→ Health Information Push (HIP APIs)
       │     └── Structured summary → FHIR Bundle → ABDM HIE
       │
       ├──→ Health Information Pull (HIU APIs)
       │     └── Fetch prior records linked to ABHA (with consent)
       │
       ├──→ Hospital HIS/EMR Integration
       │     └── HL7 FHIR R4 APIs → push summary to doctor's terminal
       │
       └──→ ABHA Personal Health Record (PHR)
             └── Patient can view their own history on PHR app
```

---

## 5. Verified Provider Ecosystem (Platform Differentiator)

> **Original idea from the solution notes — not in the PS, but a strong practical addition.**

### Problem
If only doctors/hospitals can add checkup data, how do we ensure data credibility and prevent fake or inaccurate entries?

### Design

| Layer | Mechanism |
|-------|-----------|
| **Provider Verification** | Only providers registered with NMC (National Medical Commission) / State Medical Councils / AYUSH registries can create accounts. Verified via registration number cross-check. |
| **Verified Badge** | Verified providers display a badge on the platform; patients can see which nearby clinics/hospitals are verified. |
| **Provider-Side Record Entry** | After consultation, verified doctors can directly update the patient's records on the portal (digital prescriptions, lab uploads) — bypassing OCR entirely. |
| **Online + Offline Sync** | Clinics in low-connectivity areas enter data offline; records sync to servers when connection is restored. |
| **Adoption Incentive** | Patients prefer going to verified clinics where their records are digitally updated → organic market-driven adoption. Private hospitals can instantly verify insurance coverage → incentive to join the ecosystem. |

---

## 6. Insurance & Mediclaim Module (Platform Differentiator)

> **Original idea — practical addition beyond the PS scope.**

| Feature | Detail |
|---------|--------|
| **Policy Visibility** | All linked insurance policies visible on the patient profile — policy number, provider, coverage type, sum insured |
| **Cooldown / Waiting Period Display** | If a policy is in its waiting period for a specific condition, this is clearly shown — prevents claim rejections |
| **Private Hospital Use Case** | Private hospitals can instantly verify that the patient has valid mediclaim before admitting/operating — reduces billing disputes |
| **Ayushman Bharat / PMJAY Integration** | For eligible patients, automatically checks PMJAY (Pradhan Mantri Jan Arogya Yojana) eligibility and displays covered procedures |

---

## 7. End-to-End Patient Journey

```
┌─────────────────────────────────────────────────────────────────┐
│                     PATIENT JOURNEY                             │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │  STEP 1   │    │  STEP 2   │    │  STEP 3   │    │  STEP 4   │ │
│  │ IDENTIFY  │───→│ CONVERSE  │───→│   SCAN    │───→│ SUMMARIZE │ │
│  │          │    │          │    │          │    │ & ROUTE   │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │               │               │               │        │
│  • ABHA login    • AI interview   • Upload/scan  • AI generates│
│  • Language      • Voice + Touch  • OCR + Extract• Structured  │
│    selection     • Adaptive Q's   • Timeline     • summary     │
│  • Audio-guided  • Red-flag check • Flag abnorms • Push to HIS │
│    consent       • AYUSH mode     • Drug alerts  • Link to ABHA│
│                  • (8 languages)  •              •             │
│                                                                 │
│                          ┌──────────┐                           │
│                          │  STEP 5   │                          │
│                          │  CONSULT  │                          │
│                          └──────────┘                           │
│                               │                                │
│                    • Doctor sees complete history               │
│                      on screen BEFORE patient enters           │
│                    • Edits/confirms the AI draft               │
│                    • Full consultation time devoted            │
│                      to exam, reasoning, counselling           │
│                    • Verified doctor updates records           │
│                      on portal after consultation              │
└─────────────────────────────────────────────────────────────────┘
```

### Time Impact

| Phase | Without SwasthaSetu | With SwasthaSetu |
|-------|-------------------|----------------|
| History elicitation | 1–2 min (rushed, incomplete) | **0 min** (pre-completed) |
| Document review | 1–2 min (manual paper scan) | **30 sec** (structured timeline on screen) |
| Examination | 0–1 min (often skipped) | **3–4 min** (full exam possible) |
| Counseling & prescription | 1 min | **2–3 min** (adequate counseling) |
| **Total effective consultation** | **2–5 min (mostly wasted on paperwork)** | **5–8 min (fully clinical)** |

---

## 8. Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Speech-to-Text (ASR)** | Bhashini / AI4Bharat IndicASR models | Indian-language, multi-accent speech recognition |
| **Text-to-Speech (TTS)** | Bhashini TTS / AI4Bharat IndicTTS | Audio prompts and consent explanation in regional languages |
| **Conversational AI / LLM** | Medically fine-tuned LLM (constrained by clinical ontology — ICD-10, SNOMED-CT) | Adaptive clinical interview, history structuring |
| **Clinical Ontology** | ICD-10 (diagnoses), SNOMED-CT (clinical terms), RxNorm/ATC (medications) | Standardized medical coding for interoperability |
| **OCR Engine** | Google Cloud Vision AI + custom handwriting models / Tesseract | Printed + handwritten document text extraction |
| **Document AI** | NER models trained on Indian medical documents | Clinical entity extraction (diagnoses, meds, lab values) |
| **Interoperability** | HL7 FHIR R4 APIs | ABDM integration, HIS/EMR push, ABHA linking |
| **ABDM APIs** | M1 (Authentication), HIP (Health Info Push), HIU (Health Info Pull) | National digital health ecosystem integration |
| **Frontend** | Progressive Web App (PWA) — works on any device with a browser | Cross-platform, installable, works offline |
| **Backend** | Cloud-native microservices | Scalable, secure, module-independent deployment |
| **Database** | Encrypted at rest (AES-256), FHIR-native data store | Secure health data persistence |
| **Offline Sync** | Service Workers + local storage with conflict resolution | Works in low-connectivity hospital environments |

---

## 9. Accessibility Design (Zero-Literacy First)

The platform is designed for a **60-year-old, first-time, non-literate user** as the primary persona.

| Principle | Implementation |
|-----------|---------------|
| **Icon-driven UI** | Every action represented by a large, color-coded icon — no text-only screens |
| **Audio-first guidance** | Every screen auto-plays a voice prompt explaining what to do, in the patient's language |
| **Voice input everywhere** | Patient can speak at any point; no screen requires typing |
| **Tap alternatives** | Every voice question also shows 3–4 large, illustrated tap options |
| **Large touch targets** | Minimum 48×48dp buttons, high contrast, no fine-motor-skill requirements |
| **No scrolling** | One question per screen, clear forward/back navigation |
| **Language auto-detect** | If patient starts speaking, system auto-detects language and switches |
| **Visual progress indicator** | Simple progress bar or step icons showing "you are here" in the process |
| **Zero training required** | A hospital volunteer can point the patient to the kiosk; the system takes over from there |

---

## 10. Real-World Impact Scenarios

### Scenario 1: Emergency / Accident Patient
> A road accident victim is brought unconscious to the ER. Staff search the ABHA ID (from Aadhaar card in wallet). SwasthaSetu instantly retrieves: **Type 2 DM, on Metformin, allergic to Sulfonamides, prior cardiac stent (2022).** The surgeon avoids contraindicated drugs, anesthesiologist adjusts protocol. **Time saved: critical minutes. Lives saved: possible.**

### Scenario 2: Rural Elderly Patient at Government OPD
> A 70-year-old farmer walks into a district hospital OPD with a bag of crumpled prescriptions. He speaks only Hindi, cannot read, and has never used a phone. SwasthaSetu greets him in Hindi via audio, asks about his problems through voice conversation, scans his papers via OCR, and generates a complete history. The doctor sees it all on screen. **The 3-minute consultation becomes a meaningful clinical interaction.**

### Scenario 3: Ayurvedic OPD
> A patient visits an Ayurvedic hospital. SwasthaSetu switches to AYUSH mode and conducts a Dashavidha Pariksha assessment — Prakriti analysis, Agni assessment, Koshtha evaluation, Ahara-Vihara inquiry — generating a structured Ayurvedic patient profile that would have taken 30+ minutes manually. **The Vaidya receives a complete personalized assessment.**

### Scenario 4: Private Hospital Admission
> A patient needs surgery at a private hospital. The hospital checks SwasthaSetu's insurance module — sees the patient has mediclaim from Star Health, no waiting period for this procedure, sum insured sufficient. **Admission proceeds without billing disputes. Patient doesn't face denial of treatment.**

### Scenario 5: Follow-Up Visit
> A diabetes patient returns for their quarterly check-up. SwasthaSetu pulls their ABHA-linked history, shows the doctor a trend: **HbA1c went from 7.2 → 7.8 → 8.1 over 9 months** (extracted from scanned lab reports). The doctor immediately sees the deteriorating control and adjusts treatment. **Pattern visible in seconds instead of buried in paper files.**

---

## 11. Data Flow Architecture

```
                    ┌─────────────────┐
                    │    PATIENT       │
                    │  (at platform)   │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌────────────┐ ┌───────────┐ ┌────────────┐
       │ Voice Input │ │Touch Input│ │Doc Upload  │
       │ (ASR)       │ │(Tap/Type) │ │(Scan/Photo)│
       └──────┬─────┘ └─────┬─────┘ └──────┬─────┘
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  AI Processing   │
                    │  Layer           │
                    │                 │
                    │ • LLM Interview │
                    │ • OCR + NER     │
                    │ • Summarization │
                    │ • Red-flag check│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ▼              ▼              ▼
       ┌────────────┐ ┌───────────┐ ┌────────────┐
       │ Hospital    │ │ ABDM HIE  │ │ Patient's  │
       │ HIS/EMR     │ │ (FHIR)    │ │ ABHA PHR   │
       │ (Doctor's   │ │           │ │ (Personal  │
       │  screen)    │ │           │ │  access)   │
       └────────────┘ └───────────┘ └────────────┘
```

---

## 12. Compliance & Legal Framework

| Regulation | How SwasthaSetu Complies |
|------------|----------------------|
| **Digital Personal Data Protection Act, 2023 (DPDP)** | Purpose limitation (health history only), data minimization, storage limitation, data principal rights (access, correction, erasure) |
| **ABDM Consent Framework** | Granular, time-bound, revocable consent via ABDM consent manager APIs |
| **IT Act, 2000 (Section 43A)** | Reasonable security practices for sensitive personal data |
| **Clinical Establishments Act** | Integration with registered clinical establishments only |
| **NMC / State Medical Council** | Provider verification through official registration databases |

---

## 13. What Makes This Solution Different

| vs. Generic EHR | vs. Tele-triage Apps | vs. Hospital Registration | vs. Document Scanners |
|:---:|:---:|:---:|:---:|
| Patient-driven **pre-consultation** intake, not doctor-side post-consultation entry | Works for **non-smartphone, non-literate** users at the hospital itself | Captures **full clinical history**, not just demographics | **Extracts, structures, and timelines** clinical content, not just images |
| **Voice-first + touch** dual-mode | **Offline-capable**, no stable internet needed | **AI-adaptive** interview, not static forms | **Flags abnormals and drug interactions** |
| **AYUSH-native** interview mode | **ABDM-integrated** from day one | **Verified provider** ecosystem | **Links to ABHA** record |

---

## 14. Success Metrics

| Metric | Target |
|--------|--------|
| Average pre-consultation intake time | < 10 minutes per patient |
| History completeness (sections filled vs. standard template) | > 90% |
| Physician time saved per consultation | 2–4 minutes |
| Patient usability (task completion without staff help) | > 80% for literate users, > 60% for non-literate users |
| OCR accuracy (printed documents) | > 95% |
| OCR accuracy (handwritten documents) | > 75% (with confidence-based flagging) |
| Red-flag detection sensitivity | > 95% |
| ABDM integration uptime | > 99.5% |
| Patient satisfaction (post-visit survey) | > 4.0 / 5.0 |

---

## 15. Summary

**SwasthaSetu** bridges the critical "first-mile" gap in India's healthcare system — the space between a patient arriving at the hospital and entering the consultation room. By combining:

- 🗣️ **Multilingual conversational AI** for structured history elicitation
- 📄 **Intelligent document OCR** for legacy record digitization
- 🏥 **ABDM/ABHA integration** for national health ecosystem connectivity
- 🌿 **AYUSH-native assessment** for Ayurvedic and traditional medicine
- 🔒 **DPDP-compliant consent** for privacy and trust
- 🔄 **Offline-capable, verified-provider ecosystem** for real-world deployment
- 🏥 **Insurance/Mediclaim visibility** for seamless hospital operations

...it transforms a rushed, incomplete 2-minute interaction into a **data-rich, physician-ready clinical encounter** — improving diagnostic accuracy, reducing medical errors, and giving every patient — literate or not, urban or rural — the thorough history-taking they deserve.

---

*Document prepared for Problem Statement 1.1–1.3 submission.*
