"use client";

export type AuthSession = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    roles: string[];
  };
};

const SESSION_KEY = "lumi_auth_session";
const LOGIN_GRACE_KEY = "lumi_login_grace";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
}

const REQUEST_TIMEOUT_MS = 15_000;

export type ApiJsonOptions = {
  /** Override fetch abort timeout (e.g. SMTP test can take longer than default). */
  timeoutMs?: number;
};

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
  token?: string,
  options?: ApiJsonOptions,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const timeoutMs = options?.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const redirectToRoleLogin = () => {
      clearAuthSession();
      if (typeof window !== "undefined") {
        const p = window.location.pathname;
        const loginPath = p.startsWith("/driver")
          ? "/driver/login"
          : p.startsWith("/rider")
            ? "/rider/login"
            : p.startsWith("/partner")
              ? "/partner/login"
              : p.startsWith("/admin")
                ? "/admin/login"
                : "/login";
        window.location.href = loginPath;
      }
    };

    if (!res.ok) {
      const isAuthRequest =
        path === "/auth/login" ||
        path === "/auth/register" ||
        path === "/auth/google" ||
        path === "/auth/send-otp" ||
        path === "/auth/verify-otp";
      if (res.status === 401 && !isAuthRequest) {
        const inGracePeriod =
          typeof window !== "undefined" &&
          (() => {
            const t = sessionStorage.getItem(LOGIN_GRACE_KEY);
            if (!t) return false;
            const ts = parseInt(t, 10);
            return Date.now() - ts < 8000;
          })();
        if (!inGracePeriod) {
          redirectToRoleLogin();
        }
      }
      let message = `Request failed (${res.status})`;
      try {
        const payload = (await res.json()) as { error?: string; details?: unknown };
        if (payload?.error) message = payload.error;
        if (payload?.details !== undefined && payload?.details !== null) {
          const raw =
            typeof payload.details === "string"
              ? payload.details
              : JSON.stringify(payload.details);
          if (raw && raw !== "{}" && !message.includes(raw.slice(0, 80))) {
            const clipped = raw.length > 500 ? `${raw.slice(0, 500)}…` : raw;
            message = `${message}: ${clipped}`;
          }
        }
      } catch {
        // ignore JSON parsing errors for non-JSON responses
      }

      // Some backend routes return non-401 with jwt token errors.
      if (!isAuthRequest && /jwt expired|invalid token|unauthorized/i.test(message)) {
        redirectToRoleLogin();
      }
      throw new Error(message);
    }

    return (await res.json()) as T;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error) {
      if (err.name === "AbortError") {
        throw new Error("Request timed out. Is the backend running?");
      }
      if (err.message.includes("fetch") || err.message.includes("Failed to fetch")) {
        throw new Error("Cannot reach backend. Start it with: cd backend && npm run dev");
      }
    }
    throw err;
  }
}

/** Binary responses (PDF, ZIP) with Bearer auth; does not parse JSON on success. */
export async function apiBlob(
  path: string,
  token: string,
  options?: { timeoutMs?: number; method?: string; body?: BodyInit | null; headers?: HeadersInit },
): Promise<{ blob: Blob; filename?: string }> {
  const headers = new Headers(options?.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (options?.body !== undefined && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const timeoutMs = options?.timeoutMs ?? 120_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      method: options?.method ?? "GET",
      headers,
      body: options?.body,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      let message = `Request failed (${res.status})`;
      try {
        const payload = (await res.json()) as { error?: string };
        if (payload?.error) message = payload.error;
      } catch {
        // ignore
      }
      throw new Error(message);
    }
    const cd = res.headers.get("content-disposition");
    let filename: string | undefined;
    if (cd) {
      const m = /filename\*?=(?:UTF-8'')?["']?([^"';]+)/i.exec(cd);
      if (m) filename = decodeURIComponent(m[1].replace(/["']/g, "").trim());
    }
    const blob = await res.blob();
    return { blob, filename };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("Download timed out.");
    }
    throw err;
  }
}

export function setAuthSession(session: AuthSession) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  sessionStorage.setItem(LOGIN_GRACE_KEY, String(Date.now()));
}

export function getAuthSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

