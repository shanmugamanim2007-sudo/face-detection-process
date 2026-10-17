const KEY = "visionai-backend-url";
export const DEFAULT_BACKEND = "http://localhost:8000";

export function getBackend(): string {
  if (typeof window === "undefined") return DEFAULT_BACKEND;
  return localStorage.getItem(KEY) || DEFAULT_BACKEND;
}
export function setBackend(url: string) {
  localStorage.setItem(KEY, url.replace(/\/$/, ""));
}

export const MAX_BYTES = 8 * 1024 * 1024;
export function validateImage(f: File): string | null {
  if (!/^image\/(jpeg|png|webp|bmp)$/.test(f.type)) return "Please use a JPG, PNG, WEBP or BMP image.";
  if (f.size > MAX_BYTES) return "Image must be 8 MB or smaller.";
  return null;
}

export async function postForm<T>(path: string, fields: Record<string, Blob | string>): Promise<T> {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  let res: Response;
  try {
    res = await fetch(getBackend() + path, { method: "POST", body: fd });
  } catch {
    throw new Error(
      `Could not reach the Python backend at ${getBackend()}. Start it with "uvicorn main:app --port 8000" (see backend/README.md).`,
    );
  }
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.detail || `Request failed (${res.status})`);
  return body as T;
}
