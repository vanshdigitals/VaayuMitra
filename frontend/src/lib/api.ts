/**
 * Typed API client for the VaayuMitra backend.
 * All components should import from here — never use raw fetch() in pages.
 */
import type {
  CalculateRequest,
  CalculateResponse,
  ChatMessage,
  ChatResponse,
  Entry,
  EntryCreate,
  InsightsResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    throw new Error(`Request to ${path} failed (${res.status})`);
  }
  return res.json() as Promise<T>;
}

/** Compute the annual carbon footprint breakdown for the given lifestyle inputs. */
export function calculateFootprint(payload: CalculateRequest): Promise<CalculateResponse> {
  return postJson<CalculateResponse>("/api/calculate", payload);
}

/** Fetch personalized reduction advice (Gemini with rule-based fallback). */
export function getInsights(payload: CalculateRequest): Promise<InsightsResponse> {
  return postJson<InsightsResponse>("/api/insights", payload);
}

/** Save a footprint snapshot to the device's anonymous history. */
export function saveEntry(entry: EntryCreate): Promise<Entry> {
  return postJson<Entry>("/api/entries", entry);
}

/** List the device's saved entries, newest first. */
export function listEntries(deviceId: string): Promise<Entry[]> {
  return getJson<Entry[]>(`/api/entries/${encodeURIComponent(deviceId)}`);
}

/** Send a chat message and receive a single reply. */
export function sendChat(
  profile: CalculateRequest,
  messages: ChatMessage[],
): Promise<ChatResponse> {
  return postJson<ChatResponse>("/api/chat", { profile, messages });
}

/** Check backend liveness. */
export function healthCheck(): Promise<{ status: string; version: string }> {
  return getJson("/api/health");
}
