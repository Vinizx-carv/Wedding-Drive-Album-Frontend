import { apiRequest } from './api';
export type PublicEvent = { id?: string; name: string; eventDate?: string; event_date?: string; coverUrl?: string; cover_url?: string };
export type Photo = { id: string; url?: string; photoUrl?: string; photo_url?: string; original_name?: string; originalName?: string };
function normalizePhotos(value: unknown): Photo[] {
  if (Array.isArray(value)) return value as Photo[];
  if (value && typeof value === 'object' && 'photos' in value) { const photos = (value as {photos: unknown}).photos; return Array.isArray(photos) ? photos as Photo[] : []; }
  return [];
}
export async function getEvent(token: string) {
  const value = await apiRequest<{event?: PublicEvent} | PublicEvent>(`/api/events/public/${encodeURIComponent(token)}`);
  return 'event' in value && value.event ? value.event : value as PublicEvent;
}
export async function getFeatured(token: string) { return normalizePhotos(await apiRequest<unknown>(`/api/events/public/${encodeURIComponent(token)}/featured`)); }
export function visitorId(token: string) {
  const key = `wedding-album-visitor:${token}`;
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return id;
}
export function registerVisit(token: string, id: string, name: string) {
  return apiRequest(`/api/events/public/${encodeURIComponent(token)}/visits`, { method: 'POST', body: JSON.stringify({ visitorToken: id }) });
}
export function sendPhotos(token: string, id: string, files: File[], registeredName: string) {
  const form = new FormData(); form.append('visitorToken', id); files.forEach(file => form.append('photos', file));
  return apiRequest(`/api/events/public/${encodeURIComponent(token)}/photos`, { method: 'POST', body: form });
}
export function photoUrl(photo: Photo): string {
  return (
    photo.url ??
    photo.photoUrl ??
    photo.photo_url ??
    ''
  );
}
