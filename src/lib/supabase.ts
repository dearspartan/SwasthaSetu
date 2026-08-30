// src/lib/supabase.ts
// Supabase Client Initialization for SwasthaSetu

import { createClient } from "@supabase/supabase-js";

const getEnvVar = (key: string): string => {
  const env = (typeof process !== "undefined" ? process.env : {}) as Record<string, string | undefined>;
  const metaEnv = (typeof import.meta !== "undefined" ? (import.meta as any).env : {}) as Record<string, string | undefined>;

  return env[key] || metaEnv[key] || "";
};

export const SUPABASE_URL =
  getEnvVar("VITE_SUPABASE_URL") ||
  getEnvVar("SUPABASE_URL") ||
  "https://drrrrmrasdmzpksxmxvu.supabase.co";

export const SUPABASE_ANON_KEY =
  getEnvVar("VITE_SUPABASE_ANON_KEY") ||
  getEnvVar("SUPABASE_ANON_KEY") ||
  "sb_publishable_sxEmFuoz7i1lZVWEe8krRg_bbcNTcHX";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
