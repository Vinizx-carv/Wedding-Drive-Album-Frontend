
import { useQuery } from "@tanstack/react-query";
import { getFeaturedPhotos } from "../services/featuredPhotos";

export function useFeaturedPhotos(token: string) {
  return useQuery({
    queryKey: ["featured-photos", token],
    queryFn: () => getFeaturedPhotos(token),
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}
