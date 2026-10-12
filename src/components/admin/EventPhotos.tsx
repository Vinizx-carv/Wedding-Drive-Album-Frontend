
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Image as ImageIcon,
  LoaderCircle,
  Star,
  X,
} from "lucide-react";

import {
  getPhotoImage,
  type EventPhoto,
} from "../../services/eventPhotos";

import {
  useEventPhotos,
  useUpdatePhotoFeatured,
} from "../../hooks/useEventPhotos";

interface EventPhotosProps {
  eventId: string;
  token: string;
}

function PhotoImage({
  eventId,
  photo,
  token,
  onClick,
}: {
  eventId: string;
  photo: EventPhoto;
  token: string;
  onClick?: () => void;
}) {
  const imageQuery = useQuery({
    queryKey: ["event-photo-image", eventId, photo.id],
    queryFn: () => getPhotoImage(eventId, photo.id, token),
    enabled: Boolean(eventId && photo.id && token),
    staleTime: 5 * 60 * 1000,
  });

  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (!imageQuery.data) {
      setImageUrl("");
      return;
    }

    const url = URL.createObjectURL(imageQuery.data);
    setImageUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [imageQuery.data]);

  if (imageQuery.isPending || !imageUrl) {
    return (
      <div className="flex aspect-square items-center justify-center bg-gray-100 text-gray-400">
        {imageQuery.isError ? (
          <span className="px-3 text-center text-xs">
            Erro ao carregar imagem
          </span>
        ) : (
          <LoaderCircle className="animate-spin" size={24} />
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full cursor-zoom-in"
      aria-label={`Visualizar ${photo.original_name}`}
    >
      <img
        src={imageUrl}
        alt={photo.original_name}
        className="aspect-square w-full object-cover"
        loading="lazy"
      />
    </button>
  );
}

export function EventPhotos({
  eventId,
  token,
}: EventPhotosProps) {
  const [selectedPhoto, setSelectedPhoto] =
    useState<EventPhoto | null>(null);

  const photosQuery = useEventPhotos(eventId, token);

  const featuredMutation = useUpdatePhotoFeatured(
    eventId,
    token,
  );

  const photos = photosQuery.data ?? [];

  if (photosQuery.isPending) {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-gray-500">
        <LoaderCircle className="animate-spin" />
        Carregando fotos...
      </div>
    );
  }

  if (photosQuery.isError) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <p className="font-semibold text-red-700">
          Não foi possível carregar a galeria.
        </p>

        <p className="mt-1 text-sm text-red-600">
          {photosQuery.error.message}
        </p>

        <button
          type="button"
          onClick={() => photosQuery.refetch()}
          className="mt-3 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Fotos do evento
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Gerencie as fotos e escolha quais serão exibidas
            como destaque para os convidados.
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <span className="text-sm text-gray-500">
            Total de fotos{" "}
          </span>

          <strong className="text-gray-900">
            {photos.length}
          </strong>
        </div>
      </div>

      {featuredMutation.isError && (
        <p role="alert" className="text-sm text-red-600">
          {featuredMutation.error.message}
        </p>
      )}

      {photos.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <ImageIcon
            className="mx-auto text-gray-400"
            size={40}
          />

          <h3 className="mt-4 font-semibold text-gray-900">
            Nenhuma foto enviada ainda
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Quando os convidados enviarem fotos, elas aparecerão
            nesta galeria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => {
            const isUpdating =
              featuredMutation.isPending &&
              featuredMutation.variables?.photoId === photo.id;

            return (
              <article
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative">
                  <PhotoImage
                    eventId={eventId}
                    photo={photo}
                    token={token}
                    onClick={() => setSelectedPhoto(photo)}
                  />

                  {photo.is_featured && (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800">
                      <Star size={13} fill="currentColor" />
                      Destaque
                    </span>
                  )}
                </div>

                <div className="space-y-3 p-3">
                  <p
                    className="truncate text-sm font-medium text-gray-800"
                    title={photo.original_name}
                  >
                    {photo.original_name}
                  </p>

                  <button
                    type="button"
                    disabled={featuredMutation.isPending}
                    onClick={() =>
                      featuredMutation.mutate({
                        photoId: photo.id,
                        featured: !photo.is_featured,
                      })
                    }
                    className={`flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      photo.is_featured
                        ? "border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {isUpdating ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Star
                        size={16}
                        fill={
                          photo.is_featured
                            ? "currentColor"
                            : "none"
                        }
                      />
                    )}

                    {isUpdating
                      ? "Salvando..."
                      : photo.is_featured
                        ? "Remover destaque"
                        : "Marcar destaque"}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Visualização da foto"
            className="relative w-full max-w-4xl rounded-2xl bg-white p-3 shadow-2xl sm:p-5"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Fechar visualização"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-gray-700 shadow hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <PhotoImage
              eventId={eventId}
              photo={selectedPhoto}
              token={token}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 px-1 pt-4">
              <div className="min-w-0">
                <p className="break-words font-semibold text-gray-900">
                  {selectedPhoto.original_name}
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedPhoto.is_featured
                    ? "Esta foto está em destaque."
                    : "Esta foto não está em destaque."}
                </p>
              </div>

              <button
                type="button"
                disabled={featuredMutation.isPending}
                onClick={() => {
                  featuredMutation.mutate({
                    photoId: selectedPhoto.id,
                    featured: !selectedPhoto.is_featured,
                  });

                  setSelectedPhoto(null);
                }}
                className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {selectedPhoto.is_featured
                  ? "Remover destaque"
                  : "Marcar destaque"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
