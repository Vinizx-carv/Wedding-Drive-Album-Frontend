import { apiRequest } from './api';
export type EventItem = { id: string; name: string; eventDate?: string; event_date?: string; publicToken?: string; public_token?: string; token?: string; coverUrl?: string; cover_url?: string };
function normalizeEvents(value: unknown): EventItem[] {
  if (Array.isArray(value)) return value as EventItem[];
  if (value && typeof value === 'object' && 'events' in value) { const events = (value as {events: unknown}).events; return Array.isArray(events) ? events as EventItem[] : []; }
  return [];
}
export async function listEvents(token: string) { return normalizeEvents(await apiRequest<unknown>('/api/events', {}, token)); }
export function createEvent(token: string, form: FormData) { return apiRequest('/api/events', { method: 'POST', body: form }, token); }
export async function connectGoogle(token: string) {
  const result = await apiRequest<{url?: string}>('/auth/google', {}, token);
  if (!result.url) throw new Error('A API não retornou a URL do Google. Confira a rota no backend.');
  return result.url;
}
export const eventToken = (event: EventItem) => event.publicToken || event.public_token || event.token || '';
export const eventDate = (event: EventItem) => event.eventDate || event.event_date || '';
