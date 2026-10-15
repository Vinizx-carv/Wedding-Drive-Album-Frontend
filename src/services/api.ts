export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:4000"
).replace(/\/$/, "");
export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  accessToken?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  )
    headers.set("Content-Type", "application/json");
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const type = response.headers.get("content-type") || "";
  const payload: unknown = type.includes("application/json")
    ? await response.json()
    : await response.text();
  if (!response.ok) {
    const obj =
      payload && typeof payload === "object"
        ? (payload as Record<string, unknown>)
        : null;
    throw new Error(
      String(
        obj?.error || obj?.message || payload || `Erro HTTP ${response.status}`,
      ),
    );
  }
  return payload as T;
}
