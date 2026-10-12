import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  Camera,
  CheckCircle2,
  CloudUpload,
  Heart,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
  Trash2,
  Upload,
} from "lucide-react";

import { API_URL } from "../services/api";
import {
  getEvent,
  getFeatured,
  photoUrl,
  registerVisit,
  sendPhotos,
  visitorId,
} from "../services/guestService";
import { FeaturedPhotos } from "../components/guest/FeaturedPhotos";

function resolveUrl(path?: string) {
  if (!path) return "";
  return path.startsWith("http")
    ? path
    : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(`${value.slice(0, 10)}T12:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function GuestEvent() {
  const { token = "" } = useParams<{ token: string }>();
  const client = useQueryClient();
  const input = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [guestName, setGuestName] = useState("");
  const [registeredName, setRegisteredName] = useState(() => {
  return localStorage.getItem(`guest-name:${token}`) ?? "";
});
  

  const visitor = useMemo(() => (token ? visitorId(token) : ""), [token]);

  const event = useQuery({
    queryKey: ["public-event", token],
    queryFn: () => getEvent(token),
    enabled: Boolean(token),
  });

  const featured = useQuery({
    queryKey: ["featured-photos", token],
    queryFn: () => getFeatured(token),
    enabled: Boolean(token),
  });

  const visit = useMutation({
  mutationFn: (name: string) => registerVisit(token, visitor, name),

  onSuccess: (_data, name) => {
    const normalizedName = name.trim();

    setRegisteredName(normalizedName);

    localStorage.setItem(
      `guest-name:${token}`,
      normalizedName,
    );
  },
});
  const upload = useMutation({
    mutationFn: () => sendPhotos(token, visitor, files, registeredName),
    onSuccess: async () => {
      setFiles([]);
      if (input.current) input.current.value = "";

      await client.invalidateQueries({
        queryKey: ["featured-photos", token],
      });
    },
  });

  const coverPath = event.data?.coverUrl || event.data?.cover_url || "";

  const cover = resolveUrl(coverPath);

  function selectFiles(selected: FileList | null) {
    if (!selected) return;

    const images = Array.from(selected).filter((file) =>
      file.type.startsWith("image/"),
    );

    setFiles((current) => {
      const combined = [...current, ...images];
      const unique = new Map(
        combined.map((file) => [
          `${file.name}-${file.size}-${file.lastModified}`,
          file,
        ]),
      );

      return Array.from(unique.values());
    });
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  return (
    <main className="min-h-screen bg-[#faf8f6] text-zinc-800">
      <header className="border-b border-zinc-200/70 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <a href="#inicio" className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Heart size={21} />
            </span>

            <span>
              <span className="block text-base font-semibold tracking-tight">
                Wedding Album
              </span>
              <span className="block text-xs text-zinc-500">
                Compartilhe momentos especiais
              </span>
            </span>
          </a>

          <span className="hidden items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" />
            Álbum do evento
          </span>
        </div>
      </header>

      <div id="inicio" className="mx-auto max-w-5xl px-4 py-7 sm:px-6 sm:py-10">
        {event.isPending && (
          <section className="flex min-h-72 flex-col items-center justify-center rounded-3xl border border-zinc-200 bg-white p-8 text-center shadow-sm">
            <LoaderCircle
              className="mb-4 animate-spin text-rose-400"
              size={34}
            />
            <h1 className="text-lg font-semibold">Preparando o álbum...</h1>
            <p className="mt-2 text-sm text-zinc-500">
              Estamos carregando os detalhes do evento.
            </p>
          </section>
        )}

        {event.isError && (
          <section className="rounded-3xl border border-red-100 bg-white p-8 text-center shadow-sm sm:p-12">
            <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
              <ImageIcon size={25} />
            </span>

            <h1 className="mt-5 text-2xl font-semibold">
              Não encontramos este evento
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-500">
              O link pode estar incorreto ou o evento pode estar temporariamente
              indisponível.
            </p>

            <p className="mt-3 break-words text-sm text-red-600">
              {event.error.message}
            </p>

            <button
              onClick={() => event.refetch()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-zinc-700"
            >
              <RefreshCw size={16} />
              Tentar novamente
            </button>
          </section>
        )}

        {event.data && (
          <>
            <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
              <div className="relative">
                {cover ? (
                  <img
                    src={cover}
                    alt={`Capa de ${event.data.name}`}
                    className="h-64 w-full object-cover sm:h-96"
                  />
                ) : (
                  <div className="flex h-56 items-center justify-center bg-gradient-to-br from-rose-100 via-orange-50 to-amber-100 sm:h-80">
                    <Heart
                      size={54}
                      strokeWidth={1}
                      className="text-rose-300"
                    />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-9">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
                    <Heart size={13} />
                    Um momento para recordar
                  </span>

                  <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
                    {event.data.name}
                  </h1>

                  {(event.data.eventDate || event.data.event_date) && (
                    <p className="mt-3 text-sm text-white/85 sm:text-base">
                      {formatDate(
                        event.data.eventDate || event.data.event_date,
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                <div>
                  <h2 className="text-lg font-semibold">
                    Faça parte dessa história
                  </h2>
                  <p className="mt-1 max-w-xl text-sm leading-6 text-zinc-500">
                    Compartilhe suas fotos e ajude a guardar as lembranças desse
                    dia especial.
                  </p>
                </div>

                {!registeredName ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const name = guestName.trim();

                      if (name.length >= 2 && !visit.isPending) {
                        visit.mutate(name);
                      }
                    }}
                    className="mt-5 border-t border-zinc-100 pt-5"
                  >
                    <label
                      htmlFor="guest-name"
                      className="mb-2 block text-sm font-semibold"
                    >
                      Qual é o seu nome?
                    </label>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <input
                        id="guest-name"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        minLength={2}
                        maxLength={100}
                        required
                        placeholder="Digite seu nome completo"
                        className="min-w-0 flex-1 rounded-xl border border-zinc-200 px-4 py-3 outline-none focus:border-rose-400"
                      />

                      <button
                        type="submit"
                        disabled={
                          guestName.trim().length < 2 || visit.isPending
                        }
                        className="rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white disabled:opacity-50"
                      >
                        {visit.isPending ? "Registrando..." : "Registrar nome"}
                      </button>
                    </div>

                    {visit.isError && (
                      <p className="mt-3 text-sm text-red-600">
                        {visit.error.message}
                      </p>
                    )}
                  </form>
                ) : (
                  <p className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-800">
                    Olá, <strong>{registeredName}</strong>! Agora você pode
                    enviar suas fotos.
                  </p>
                )}
              </div>

              {visit.isError && (
                <p
                  role="alert"
                  className="mx-5 mb-5 rounded-xl bg-red-50 p-3 text-sm text-red-700 sm:mx-7"
                >
                  {visit.error.message}
                </p>
              )}

              {visit.isSuccess && (
                <p className="mx-5 mb-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 sm:mx-7">
                  Obrigado pela visita!
                </p>
              )}
            </section>

            <section className="mt-7 rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm sm:mt-8 sm:p-8">
              <div className="mb-6 flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">
                  <Camera size={23} />
                </span>

                <div>
                  <h2 className="text-xl font-semibold">
                    Compartilhe suas fotos
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-zinc-500">
                    Selecione as imagens que você tirou durante o evento.
                  </p>
                </div>
              </div>

              {registeredName ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();

                    if (files.length && !upload.isPending) {
                      upload.mutate();
                    }
                  }}
                >
                  <label
                    htmlFor="guest-photos"
                    className="group flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/70 px-5 py-10 text-center transition hover:border-rose-300 hover:bg-rose-50/40 sm:py-12"
                  >
                    <span className="flex size-14 items-center justify-center rounded-2xl bg-white text-rose-500 shadow-sm transition group-hover:scale-105">
                      <CloudUpload size={28} />
                    </span>

                    <span className="mt-4 font-semibold">
                      Toque para selecionar suas fotos
                    </span>

                    <span className="mt-2 text-sm text-zinc-500">
                      Você pode selecionar várias imagens.
                    </span>

                    <span className="mt-4 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition group-hover:bg-zinc-700">
                      Escolher imagens
                    </span>

                    <input
                      id="guest-photos"
                      ref={input}
                      type="file"
                      accept="image/*"
                      multiple
                      className="sr-only"
                      onChange={(e) => selectFiles(e.target.files)}
                    />
                  </label>

                  {files.length > 0 && (
                    <div className="mt-6">
                      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">Fotos selecionadas</h3>
                          <p className="mt-1 text-sm text-zinc-500">
                            {files.length}{" "}
                            {files.length === 1
                              ? "imagem selecionada"
                              : "imagens selecionadas"}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setFiles([]);
                            if (input.current) {
                              input.current.value = "";
                            }
                          }}
                          className="text-sm font-medium text-zinc-500 transition hover:text-red-600"
                        >
                          Limpar seleção
                        </button>
                      </div>

                      <ul className="divide-y divide-zinc-100 rounded-xl border border-zinc-200">
                        {files.map((file, index) => (
                          <li
                            key={`${file.name}-${file.size}-${file.lastModified}`}
                            className="flex min-w-0 items-center gap-3 p-3"
                          >
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
                              <ImageIcon size={19} />
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">
                                {file.name}
                              </span>
                              <span className="mt-1 block text-xs text-zinc-500">
                                {(file.size / (1024 * 1024)).toFixed(2)} MB
                              </span>
                            </span>

                            <button
                              type="button"
                              aria-label={`Remover ${file.name}`}
                              onClick={() => removeFile(index)}
                              className="rounded-lg p-2 text-zinc-400 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 size={17} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {upload.isError && (
                    <p
                      role="alert"
                      className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700"
                    >
                      Não foi possível enviar as fotos: {upload.error.message}
                    </p>
                  )}

                  {upload.isSuccess && (
                    <p className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700">
                      <CheckCircle2 size={18} />
                      Fotos enviadas com sucesso!
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={!files.length || upload.isPending}
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3.5 font-semibold text-white shadow-sm transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-zinc-300 sm:w-auto"
                  >
                    {upload.isPending ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" />
                        Enviando fotos...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Enviar {files.length || ""}{" "}
                        {files.length === 1 ? "foto" : "fotos"}
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <p className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
                  Registre seu nome acima para liberar o envio de fotos.
                </p>
              )}
            </section>

            {registeredName && (
              <section className="mx-auto mt-8 max-w-6xl px-4">
                <h2 className="mb-5 text-2xl font-bold text-gray-900">
                  Fotos em destaque
                </h2>

                <FeaturedPhotos token={token} />
              </section>
            )}

            <footer className="py-10 text-center">
              <Heart size={19} className="mx-auto text-rose-400" />
              <p className="mt-3 text-sm font-medium text-zinc-600">
                Cada foto guarda uma lembrança.
              </p>
              <p className="mt-1 text-xs text-zinc-400">Wedding Drive Album</p>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}
