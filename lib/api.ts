export interface ApiError extends Error {
  status?: number
  code?: string
  details?: unknown
}

const API_BASE_URL = ((globalThis as any)?.process?.env?.NEXT_PUBLIC_API_BASE_URL as string | undefined) ||
  "http://localhost:4000/api/v1"

const ACCESS_TOKEN_KEY = "sawerni_access_token"

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string | null) {
  if (typeof window === "undefined") return
  if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token)
  else localStorage.removeItem(ACCESS_TOKEN_KEY)
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
    if (!res.ok) return null
    const data = await res.json().catch(() => ({}))
    const token = (data as any)?.accessToken as string | undefined
    if (token) {
      setAccessToken(token)
      return token
    }
    return null
  } catch {
    return null
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: {
    method?: HttpMethod
    body?: any
    headers?: Record<string, string>
    signal?: AbortSignal
    multipart?: boolean
  } = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`

  const token = getAccessToken()
  const isMultipart = options.multipart === true
  const headers: Record<string, string> = {
    ...(isMultipart ? {} : { "Content-Type": "application/json" }),
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }

  const doRequest = async (): Promise<Response> =>
    fetch(url, {
      method: options.method || "GET",
      credentials: "include",
      headers,
      body: options.body ? (isMultipart ? options.body : JSON.stringify(options.body)) : undefined,
      signal: options.signal,
    })

  let res = await doRequest()
  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (newToken) {
      headers.Authorization = `Bearer ${newToken}`
      res = await doRequest()
    }
  }

  const isJson = res.headers.get("content-type")?.includes("application/json")
  const payload = isJson ? await res.json().catch(() => ({})) : await res.text()

  if (!res.ok) {
    // Extract error message from backend response format
    const errorMessage = payload?.error || payload?.message || res.statusText
    const err = new Error(errorMessage) as ApiError
    err.status = res.status
    err.code = payload?.code
    err.details = payload?.details
    throw err
  }

  return payload as T
}

export const Api = {
  get: <T>(path: string, headers?: Record<string, string>) => apiFetch<T>(path, { method: "GET", headers }),
  post: <T>(path: string, body?: any, headers?: Record<string, string>) =>
    apiFetch<T>(path, { method: "POST", body, headers }),
  put: <T>(path: string, body?: any, headers?: Record<string, string>) =>
    apiFetch<T>(path, { method: "PUT", body, headers }),
  patch: <T>(path: string, body?: any, headers?: Record<string, string>) =>
    apiFetch<T>(path, { method: "PATCH", body, headers }),
  delete: <T>(path: string, headers?: Record<string, string>) => apiFetch<T>(path, { method: "DELETE", headers }),
}