
import { API_URL } from "./api";

export interface EventPhoto {
  id: string;
  event_id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  is_featured: boolean;
  created_at: string;
  imageUrl: string;
}

interface EventPhotosResponse {
  photos: EventPhoto[];
}

function getHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getEventPhotos(
  eventId: string,
  token: string,
): Promise<EventPhoto[]> {
  const response = await fetch(
    `${API_URL}/api/events/${eventId}/photos`,
    {
      headers: getHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar as fotos.");
  }

  const result: EventPhotosResponse = await response.json();
  return result.photos;
}

export async function getPhotoImage(
  eventId: string,
  photoId: string,
  token: string,
): Promise<Blob> {
  const response = await fetch(
    `${API_URL}/api/events/${eventId}/photos/${photoId}/image`,
    {
      headers: getHeaders(token),
    },
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar a imagem.");
  }

  return response.blob();
}

export async function updatePhotoFeatured(
  eventId: string,
  photoId: string,
  featured: boolean,
  token: string,
): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/events/${eventId}/photos/${photoId}/featured`,
    {
      method: "PATCH",
      headers: {
        ...getHeaders(token),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ featured }),
    },
  );

  if (!response.ok) {
    const result = await response.json().catch(() => null);

    throw new Error(
      result?.message ?? "Não foi possível atualizar o destaque.",
    );
  }
}
