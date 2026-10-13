import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import {
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Clipboard,
  ExternalLink,
  ImagePlus,
  LoaderCircle,
  LogOut,
  Plus,
  RefreshCw,
  Users,
  X,
  Cloud,
  CheckCircle
} from "lucide-react";
import { useDriveStatus } from "../hooks/useDriveStatus";
import { supabase } from "../services/supabase";
import { API_URL } from "../services/api";
import {
  connectGoogle,
  createEvent,
  eventDate,
  eventToken,
  listEvents,
} from "../services/adminService";

type EventItem = {
  id: string;
  name: string;
  eventDate?: string;
  event_date?: string;
  publicToken?: string;
  public_token?: string;
  token?: string;
  coverUrl?: string;
  cover_url?: string;
  maxPhotosPerGuest?: number;
  maxGuests?: number;
  photoCount?: number;
  photosCount?: number;
  visitorCount?: number;
  visitsCount?: number;
};

function resolveUrl(path?: string) {
  if (!path) return "";
  return path.startsWith("http")
    ? path
    : `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function AdminDashboard() {
  const driveStatus = useDriveStatus();
  const client = useQueryClient();
  const navigate = useNavigate();
  const fileInput = useRef<HTMLInputElement>(null);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [copiedEvent, setCopiedEvent] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [maxPhotos, setMaxPhotos] = useState("10");
  const [maxGuests, setMaxGuests] = useState("");
  const [cover, setCover] = useState<File | null>(null);

  const events = useQuery({
    queryKey: ["admin-events"],
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error("Sessão expirada.");

      return listEvents(data.session.access_token);
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error("Sessão expirada.");
      if (!cover) throw new Error("Selecione uma imagem de capa.");

      const form = new FormData();
      form.append("name", name.trim());
      form.append("eventDate", date);
      form.append("maxPhotosPerGuest", maxPhotos);

      if (maxGuests) form.append("maxGuests", maxGuests);
      form.append("cover", cover);

      return createEvent(data.session.access_token, form);
    },
    onSuccess: async () => {
      setName("");
      setDate("");
      setMaxPhotos("10");
      setMaxGuests("");
      setCover(null);
      setShowCreateForm(false);

      if (fileInput.current) fileInput.current.value = "";

      await client.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });

  const google = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error("Sessão expirada.");

      return connectGoogle(data.session.access_token);
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
  });

  async function logout() {
    await supabase.auth.signOut();
    client.clear();
    window.location.href = "/admin/login";
  }

  function publicUrl(token: string) {
    return `${window.location.origin}/evento/${encodeURIComponent(token)}`;
  }

  async function copyLink(link: string, id: string) {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedEvent(id);
      window.setTimeout(() => {
        setCopiedEvent((current) => (current === id ? null : current));
      }, 2000);
    } catch {
      window.prompt("Copie o link do evento:", link);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-zinc-700 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  const labelClass = "grid gap-2 text-sm font-medium";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-blue-600">
              Wedding Drive Album
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Seus eventos
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Gerencie seus álbuns, acompanhe os envios e compartilhe os links.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setShowCreateForm((current) => !current);
                create.reset();
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              {showCreateForm ? <X size={18} /> : <Plus size={18} />}
              {showCreateForm ? "Cancelar" : "Novo evento"}
            </button>

            <button
              onClick={() => google.mutate()}
              disabled={google.isPending || driveStatus.isLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              {google.isPending ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Conectando...
                </>
              ) : driveStatus.data?.connected ? (
                <>
                  <CheckCircle size={17} className="text-green-600" />
                  Google Drive conectado
                </>
              ) : (
                <>
                  <Cloud size={17} />
                  Conectar Google Drive
                </>
              )}
            </button>

            <button
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <LogOut size={17} />
              Sair
            </button>
          </div>
        </header>

        {google.isError && (
          <p
            role="alert"
            className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {google.error.message}
          </p>
        )}

        {showCreateForm && (
          <section className="mb-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-blue-600">
                  Novo álbum
                </p>
                <h2 className="mt-2 text-xl font-bold">Criar evento</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Defina os dados e a capa do seu evento.
                </p>
              </div>

              <button
                type="button"
                aria-label="Fechar formulário"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              >
                <X size={20} />
              </button>
            </div>

            <form
              className="grid gap-5 md:grid-cols-2"
              onSubmit={(e) => {
                e.preventDefault();
                create.mutate();
              }}
            >
              <label className={labelClass}>
                Nome do evento
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Casamento de Ana e João"
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Data do evento
                <input
                  required
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Máximo de fotos por convidado
                <input
                  required
                  min="1"
                  type="number"
                  value={maxPhotos}
                  onChange={(e) => setMaxPhotos(e.target.value)}
                  className={inputClass}
                />
              </label>

              <label className={labelClass}>
                Limite de convidados (opcional)
                <input
                  min="1"
                  type="number"
                  value={maxGuests}
                  onChange={(e) => setMaxGuests(e.target.value)}
                  placeholder="Ex.: 150"
                  className={inputClass}
                />
              </label>

              <label className={`${labelClass} md:col-span-2`}>
                Imagem de capa
                <input
                  ref={fileInput}
                  required
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] ?? null)}
                  className="w-full rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700 file:mr-4 file:rounded-lg file:border-0 file:bg-gray-100 file:px-4 file:py-2 file:font-semibold file:text-gray-700 hover:file:bg-gray-200"
                />
              </label>

              {create.isError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 md:col-span-2"
                >
                  {create.error.message}
                </p>
              )}

              {create.isSuccess && (
                <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 md:col-span-2">
                  Evento criado com sucesso!
                </p>
              )}

              <div className="flex flex-wrap gap-3 md:col-span-2">
                <button
                  type="submit"
                  disabled={create.isPending}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {create.isPending && (
                    <LoaderCircle size={17} className="animate-spin" />
                  )}
                  {create.isPending ? "Criando evento..." : "Criar evento"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    create.reset();
                  }}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <section>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Todos os eventos</h2>
              <p className="mt-1 text-sm text-gray-500">
                {events.isSuccess
                  ? `${events.data.length} evento(s) cadastrado(s)`
                  : "Seus álbuns e informações"}
              </p>
            </div>

            <button
              onClick={() => events.refetch()}
              disabled={events.isFetching}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                size={16}
                className={events.isFetching ? "animate-spin" : ""}
              />
              Atualizar
            </button>
          </div>

          {events.isPending && (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-gray-200 bg-white py-16 text-sm text-gray-500">
              <LoaderCircle size={20} className="animate-spin" />
              Carregando seus eventos...
            </div>
          )}

          {events.isError && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <p className="font-semibold">
                Não foi possível carregar os eventos.
              </p>
              <p className="mt-2">{events.error.message}</p>
              <button
                onClick={() => events.refetch()}
                className="mt-4 rounded-lg border border-red-200 px-4 py-2 hover:bg-red-100"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {events.isSuccess && events.data.length === 0 && (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-5 py-16 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ImagePlus size={26} />
              </span>
              <h3 className="mt-5 text-lg font-semibold">
                Seu primeiro evento começa aqui
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Crie um evento para compartilhar um link com seus convidados e
                reunir as fotos em um só lugar.
              </p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                <Plus size={18} />
                Criar primeiro evento
              </button>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-2">
            {events.data?.map((rawEvent) => {
              const event = rawEvent as EventItem;
              const token = eventToken(event);
              const link = token ? publicUrl(token) : "";
              const cover = resolveUrl(event.coverUrl || event.cover_url);
              const expanded = expandedEvent === event.id;

              const photoCount = event.photoCount ?? event.photosCount;
              const visitorCount = event.visitorCount ?? event.visitsCount;

              return (
                <article
                  key={event.id}
                  className={`min-w-0 overflow-hidden rounded-2xl border bg-white text-gray-900 shadow-sm transition ${
                    expanded
                      ? "border-blue-300 shadow-md"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="relative">
                    {cover ? (
                      <img
                        src={cover}
                        alt={`Capa de ${event.name}`}
                        className="h-48 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-40 items-center justify-center bg-gray-100">
                        <ImagePlus size={32} className="text-gray-400" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-blue-200">
                        Álbum do evento
                      </p>
                      <h3 className="break-words text-xl font-bold text-white">
                        {event.name}
                      </h3>
                      {eventDate(event) && (
                        <p className="mt-2 flex items-center gap-2 text-sm text-gray-200">
                          <CalendarDays size={15} />
                          {eventDate(event)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 p-5">
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Camera size={16} />
                        <span className="text-xs">Fotos enviadas</span>
                      </div>
                      <p className="mt-2 text-xl font-bold">
                        {photoCount ?? "—"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Users size={16} />
                        <span className="text-xs">Visitas registradas</span>
                      </div>
                      <p className="mt-2 text-xl font-bold">
                        {visitorCount ?? "—"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 px-5 pb-5">
                    <button
                      onClick={() => navigate(`/admin/eventos/${event.id}`)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Ver detalhes
                      <ExternalLink size={17} />
                    </button>

                    {link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        <ExternalLink size={16} />
                        Abrir álbum
                      </a>
                    )}
                  </div>

                  {expanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-5">
                      <h4 className="font-semibold">Informações do evento</h4>

                      <dl className="mt-4 grid grid-cols-2 gap-4">
                        <div>
                          <dt className="text-xs text-gray-500">
                            Limite de fotos por convidado
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {event.maxPhotosPerGuest ?? "Não informado"}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs text-gray-500">
                            Limite de convidados
                          </dt>
                          <dd className="mt-1 font-semibold">
                            {event.maxGuests ?? "Não informado"}
                          </dd>
                        </div>
                      </dl>

                      <div className="mt-5">
                        <p className="mb-2 text-sm font-medium text-gray-700">
                          Link para os convidados
                        </p>

                        {link ? (
                          <>
                            <a
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="block break-all text-sm text-blue-600 hover:text-blue-700"
                            >
                              {link}
                            </a>
                            <button
                              onClick={() => void copyLink(link, event.id)}
                              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            >
                              {copiedEvent === event.id ? (
                                <Check size={16} />
                              ) : (
                                <Clipboard size={16} />
                              )}
                              {copiedEvent === event.id
                                ? "Link copiado"
                                : "Copiar link"}
                            </button>
                          </>
                        ) : (
                          <p className="text-sm text-amber-700">
                            A API não retornou o token público deste evento.
                          </p>
                        )}
                      </div>

                      {link && (
                        <div className="mt-5">
                          <p className="mb-3 text-sm font-medium text-gray-700">
                            QR Code do evento
                          </p>
                          <div className="inline-flex rounded-xl bg-white p-3 shadow-sm">
                            <QRCodeSVG value={link} size={150} />
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            Os convidados podem escanear para abrir o álbum.
                          </p>
                        </div>
                      )}

                      <div className="mt-5 rounded-xl border border-dashed border-gray-300 p-4">
                        <div className="flex items-center gap-2">
                          <ImagePlus size={18} className="text-blue-600" />
                          <p className="font-medium">Fotos enviadas</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          A listagem e a visualização das fotos precisam de uma
                          rota da API que retorne as imagens deste evento. Essa
                          rota ainda não está definida no serviço de frontend
                          atual.
                        </p>
                      </div>

                      <div className="mt-4 rounded-xl border border-dashed border-gray-300 p-4">
                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-blue-600" />
                          <p className="font-medium">Convidados e visitas</p>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                          Os contadores serão exibidos quando o backend retornar
                          as quantidades reais. Visitas registradas não
                          representam necessariamente pessoas únicas.
                        </p>
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-gray-500">
          Wedding Drive Album · Painel administrativo
        </footer>
      </div>
    </main>
  );
}
