
import { API_URL } from "./api";

export interface FeaturedPhoto {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  is_featured: boolean;
  imageUrl: string;
}

export async function getFeaturedPhotos(
  token: string,
): Promise<FeaturedPhoto[]> {
  const response = await fetch(
    `${API_URL}/api/events/public/${encodeURIComponent(token)}/featured`,
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar as fotos destacadas.");
  }

  const data: { photos: FeaturedPhoto[] } = await response.json();

  return data.photos;
}
