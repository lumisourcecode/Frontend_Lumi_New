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

export async function apiJson<T>(
  path: string,
  init?: RequestInit,
  token?: string,
): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers,
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      const isAuthRequest = path === "/auth/login" || path === "/auth/register";
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
        }
      }
      let message = `Request failed (${res.status})`;
      try {
        const payload = (await res.json()) as { error?: string };
        if (payload?.error) message = payload.error;
      } catch {
        // ignore JSON parsing errors for non-JSON responses
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

