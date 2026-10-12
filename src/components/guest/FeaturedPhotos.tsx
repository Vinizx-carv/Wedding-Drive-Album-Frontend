
import { useFeaturedPhotos } from "../../hooks/useFeaturedPhotos";
import { API_URL } from "../../services/api";

interface FeaturedPhotosProps {
  token: string;
}

function resolveImageUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `${API_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

export function FeaturedPhotos({ token }: FeaturedPhotosProps) {
  const {
    data: photos = [],
    isPending,
    isError,
    error,
  } = useFeaturedPhotos(token);

  if (isPending) {
    return (
      <p className="py-8 text-center text-gray-500">
        Carregando fotos do evento...
      </p>
    );
  }

  if (isError) {
    return (
      <p className="py-8 text-center text-red-600">
        {error instanceof Error
          ? error.message
          : "Não foi possível carregar as fotos."}
      </p>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 p-8 text-center">
        <h3 className="font-semibold text-gray-800">
          Nenhuma foto em destaque ainda
        </h3>
        <p className="mt-2 text-sm text-gray-500">
          As fotos selecionadas pelo administrador aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => {
          const src = resolveImageUrl(photo.imageUrl);
          const caption = photo.original_name || "Foto do evento";

          return (
            <figure
              key={photo.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            >
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                aria-label={`Abrir ${caption}`}
              >
                <img
                  src={src}
                  alt={caption}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </a>

              <figcaption className="truncate px-3 py-2 text-sm text-gray-600">
                {caption}
              </figcaption>
            </figure>
          );
        })}
      </div>
    </section>
  );
}
