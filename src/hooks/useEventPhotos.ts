
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  getEventPhotos,
  updatePhotoFeatured,
} from "../services/eventPhotos";

export function useEventPhotos(
  eventId: string,
  token: string,
) {
  return useQuery({
    queryKey: ["event-photos", eventId],
    queryFn: () => getEventPhotos(eventId, token),
    enabled: Boolean(eventId && token),
  });
}

export function useUpdatePhotoFeatured(
  eventId: string,
  token: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      photoId,
      featured,
    }: {
      photoId: string;
      featured: boolean;
    }) =>
      updatePhotoFeatured(
        eventId,
        photoId,
        featured,
        token,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["event-photos", eventId],
      });

      queryClient.invalidateQueries({
        queryKey: ["event-stats", eventId],
      });
    },
  });
}
