import { API_BASE_URL } from './env'

export class ApiError extends Error {
  status: number
  body: unknown
  constructor(status: number, body: unknown, message: string) {
    super(message)
    this.status = status
    this.body = body
  }
}

async function request<T>(
  path: string,
  init?: RequestInit & { json?: unknown },
): Promise<T> {
  const headers = new Headers(init?.headers)
  let body = init?.body
  if (init?.json !== undefined) {
    headers.set('content-type', 'application/json')
    body = JSON.stringify(init.json)
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    ...init,
    headers,
    body,
  })
  const text = await res.text()
  const data = text ? safeJson(text) : null
  if (!res.ok) {
    const msg =
      (data && typeof data === 'object' && 'error' in data
        ? String((data as { error: unknown }).error)
        : null) ?? res.statusText
    throw new ApiError(res.status, data, msg)
  }
  return data as T
}

function safeJson(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: 'POST', json }),
  patch: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: 'PATCH', json }),
  put: <T>(path: string, json?: unknown) =>
    request<T>(path, { method: 'PUT', json }),
  putForm: <T>(path: string, body: BodyInit) =>
    request<T>(path, { method: 'PUT', body }),
  del: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
}
