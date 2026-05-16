export function authHeaders(): HeadersInit {
  try {
    const session = JSON.parse(window.localStorage.getItem("ccpng.session") || "null") as
      | { id?: string; role?: string }
      | null;
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (session?.role && session.role !== "visitor") {
      headers["x-user-role"] = session.role;
    }
    if (session?.id) {
      headers["x-user-id"] = session.id;
    }
    return headers;
  } catch {
    return { "Content-Type": "application/json" };
  }
}

export async function apiJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}
