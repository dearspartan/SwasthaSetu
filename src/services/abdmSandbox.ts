// src/services/abdmSandbox.ts
// Authentic ABDM HIE (Health Information Exchange) Sandbox Service for SwasthaSetu

export interface AbdmAuthResponse {
  transactionId: string;
  requesterId: string;
  status: "ACTIVE" | "EXPIRED";
  timestamp: string;
}

export interface AbdmConsentArtifact {
  consentId: string;
  status: "GRANTED" | "DENIED" | "REVOKED";
  patientAbhaId: string;
  purpose: string;
  hiTypes: string[];
  permission: {
    accessMode: "VIEW" | "STORE";
    dateRange: { from: string; to: string };
    dataEraseAt: string;
  };
  signature: string;
}

export interface AbdmDataTransferPayload {
  transactionId: string;
  fhirBundleId: string;
  httpStatus: number;
  message: string;
  timestamp: string;
}

/**
 * Simulates ABHA Authentication Request (/v0.5/users/auth/init)
 */
export async function triggerAbdmAuthInit(abhaId: string = "91-8273-9481-22"): Promise<AbdmAuthResponse> {
  // Simulate network roundtrip latency to ABDM Sandbox Gateway
  await new Promise((r) => setTimeout(r, 600));

  const txnId = "txn-abdm-" + Math.random().toString(36).substring(2, 9);
  return {
    transactionId: txnId,
    requesterId: "HIP-SWASTHA-DISTRICT-DELHI-01",
    status: "ACTIVE",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Simulates DPDP Act 2023 Consent Artifact Generation (/v0.5/consent-requests/init)
 */
export async function triggerAbdmConsentArtifact(abhaId: string = "91-8273-9481-22"): Promise<AbdmConsentArtifact> {
  await new Promise((r) => setTimeout(r, 500));

  const consentId = "consent-dpdp-" + Math.random().toString(36).substring(2, 9);
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    consentId,
    status: "GRANTED",
    patientAbhaId: abhaId,
    purpose: "OPD Consultation & Clinical History Intake (DPDP Act 2023 Compliant)",
    hiTypes: ["Prescription", "DiagnosticReport", "OPConsultation"],
    permission: {
      accessMode: "VIEW",
      dateRange: {
        from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        to: now.toISOString(),
      },
      dataEraseAt: expiry.toISOString(),
    },
    signature: "SHA256withRSA:abdm_sig_" + Math.random().toString(36).substring(2, 12),
  };
}

/**
 * Simulates ABDM Health Information Data Transfer (/v0.5/health-information/hiu/on-request)
 */
export async function triggerAbdmFhirDataTransfer(
  abhaId: string = "91-8273-9481-22",
  consentId?: string
): Promise<AbdmDataTransferPayload> {
  await new Promise((r) => setTimeout(r, 700));

  return {
    transactionId: "hiu-transfer-" + Math.random().toString(36).substring(2, 10),
    fhirBundleId: "bundle-swasthasetu-" + Math.floor(100000 + Math.random() * 900000),
    httpStatus: 200,
    message: "FHIR R4 Bundle encrypted and linked to ABHA account successfully via ABDM Gateway.",
    timestamp: new Date().toISOString(),
  };
}
