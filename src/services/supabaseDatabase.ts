// src/services/supabaseDatabase.ts
// SwasthaSetu Supabase Database Integration (Sessions, Consent, OCR Docs & Queue)

import { supabase } from "@/lib/supabase";

export interface SupabaseIntakeSession {
  id?: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  abha_id: string;
  facility: string;
  department: string;
  clinical_mode: "allopathy" | "ayush";
  chief_complaint: string;
  hpi_summary: string;
  differentials: any[];
  token_number: string;
  status: "QUEUE" | "IN_CONSULT" | "COMPLETED";
  created_at?: string;
}

/**
 * Persists a completed intake session into Supabase 'intake_sessions' table
 */
export async function saveIntakeSessionToSupabase(session: SupabaseIntakeSession) {
  try {
    const { data, error } = await supabase
      .from("intake_sessions")
      .insert([
        {
          patient_name: session.patient_name,
          patient_age: session.patient_age,
          patient_gender: session.patient_gender,
          abha_id: session.abha_id,
          facility: session.facility,
          department: session.department,
          clinical_mode: session.clinical_mode,
          chief_complaint: session.chief_complaint,
          hpi_summary: session.hpi_summary,
          differentials: JSON.stringify(session.differentials || []),
          token_number: session.token_number,
          status: session.status || "QUEUE",
          created_at: new Date().toISOString(),
        },
      ])
      .select();

    if (error) {
      console.warn("Supabase insert notice (using local persistence fallback):", error.message);
      saveLocalSessionFallback(session);
      return null;
    }

    return data?.[0] || null;
  } catch (err) {
    console.warn("Supabase session error:", err);
    saveLocalSessionFallback(session);
    return null;
  }
}

/**
 * Persists patient DPDP Act 2023 Consent Artifact to Supabase 'patient_consents' table
 */
export async function savePatientConsentToSupabase(abhaId: string, consentTypes: string[]) {
  try {
    const { data, error } = await supabase.from("patient_consents").insert([
      {
        abha_id: abhaId,
        consent_types: consentTypes,
        status: "GRANTED",
        granted_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn("Supabase consent notice:", error.message);
    }
    return data;
  } catch (err) {
    console.warn("Supabase consent error:", err);
  }
}

/**
 * LocalStorage Fallback for OPD Queue when Supabase table is bootstrapping
 */
function saveLocalSessionFallback(session: SupabaseIntakeSession) {
  try {
    const existing = JSON.parse(localStorage.getItem("swasthasetu_local_sessions") || "[]");
    existing.unshift({ ...session, id: "session-local-" + Date.now() });
    localStorage.setItem("swasthasetu_local_sessions", JSON.stringify(existing.slice(0, 20)));
  } catch (e) {
    console.warn("Local storage fallback notice:", e);
  }
}

/**
 * Fetches active OPD queue sessions for Doctor Terminal
 */
export async function fetchQueueSessionsFromSupabase(): Promise<SupabaseIntakeSession[]> {
  try {
    const { data, error } = await supabase
      .from("intake_sessions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      const local = JSON.parse(localStorage.getItem("swasthasetu_local_sessions") || "[]");
      return local;
    }

    return data.map((item: any) => ({
      ...item,
      differentials: typeof item.differentials === "string" ? JSON.parse(item.differentials) : item.differentials,
    }));
  } catch (e) {
    const local = JSON.parse(localStorage.getItem("swasthasetu_local_sessions") || "[]");
    return local;
  }
}
