import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const KIOSK_LS_URL_KEY  = "kiosk_supabase_url";
export const KIOSK_LS_ANON_KEY = "kiosk_supabase_anon_key";

/** 싱글톤 캐시 — URL·Key 조합이 바뀌면 자동 교체 */
let _client: SupabaseClient | null = null;
let _cachedUrl = "";
let _cachedKey = "";

/**
 * 우선순위: localStorage → Vite 빌드 환경변수 → null
 * localStorage 값은 운영자 패널에서 저장.
 * 값이 바뀌면 새 클라이언트를 생성하고 캐시 교체.
 */
export function getSupabase(): SupabaseClient | null {
  const url =
    localStorage.getItem(KIOSK_LS_URL_KEY)  || import.meta.env.VITE_SUPABASE_URL  || "";
  const key =
    localStorage.getItem(KIOSK_LS_ANON_KEY) || import.meta.env.VITE_SUPABASE_ANON_KEY || "";

  if (!url || !key) return null;

  if (_client && url === _cachedUrl && key === _cachedKey) {
    return _client;
  }

  _client    = createClient(url, key);
  _cachedUrl = url;
  _cachedKey = key;
  return _client;
}

/** 저장된 localStorage 설정을 반환 (운영자 패널 표시용) */
export function getSavedSupabaseConfig(): { url: string; anonKey: string } {
  return {
    url:     localStorage.getItem(KIOSK_LS_URL_KEY)  ?? "",
    anonKey: localStorage.getItem(KIOSK_LS_ANON_KEY) ?? "",
  };
}

/** 운영자 패널에서 저장 후 호출. 캐시 초기화 → reload 권장. */
export function saveSupabaseConfig(url: string, anonKey: string): void {
  localStorage.setItem(KIOSK_LS_URL_KEY,  url.trim());
  localStorage.setItem(KIOSK_LS_ANON_KEY, anonKey.trim());
  _client    = null;
  _cachedUrl = "";
  _cachedKey = "";
}
