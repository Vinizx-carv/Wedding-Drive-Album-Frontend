import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  ExternalLink,
  Image,
  LoaderCircle,
  Users,
} from "lucide-react";

import { supabase } from "../services/supabase";
import { API_URL } from "../services/api";
import { listEvents, eventToken } from "../services/adminService";
import { apiRequest } from "../services/api";
import { EventPhotos } from "../components/admin/EventPhotos";

type EventItem = {
  id: string;
  name: string;
  event_date?: string;
  eventDate?: string;
  public_token?: string;
  publicToken?: string;
  coverUrl?: string;
  cover_file_id?: string;
  maxPhotosPerGuest?: number;
  maxGuests?: number;
};

type EventStats = {
  uniqueVisitors: number;
  totalPhotos: number;
  featuredPhotos: number;
};

function resolveUrl(path?: string) {
  if (!path) return "";
  if (path.startsWith("http")) return path;

  return `${API_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export default function AdminEventDetails() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const details = useQuery({
    queryKey: ["admin-event-details", eventId],
    enabled: Boolean(eventId),
    queryFn: async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (!data.session) throw new Error("Sessão expirada.");

      const token = data.session.access_token;
      const [events, stats] = await Promise.all([
        listEvents(token),
        apiRequest<EventStats>(
          `/api/events/${encodeURIComponent(eventId!)}/stats`,
          {},
          token,
        ),
      ]);

      const event = (events as EventItem[]).find((item) => item.id === eventId);

      if (!event) throw new Error("Evento não encontrado.");

      return {
        event,
        stats,
        session: data.session,
      };
    },
  });

  if (details.isPending) {
    return (
      <main className="grid min-h-screen place-items-center bg-gray-50 text-gray-600">
        <p className="flex items-center gap-2">
          <LoaderCircle className="animate-spin" />
          Carregando detalhes...
        </p>
      </main>
    );
  }

  if (details.isError) {
    return (
      <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 flex items-center gap-2"
        >
          <ArrowLeft size={18} /> Voltar aos eventos
        </button>
        <p className="rounded-xl border border-red-200 bg-white p-5 text-red-600">
          {details.error.message}
        </p>
      </main>
    );
  }

  const { event, stats, session } = details.data;
  const token = eventToken(event);
  const link = token
    ? `${window.location.origin}/evento/${encodeURIComponent(token)}`
    : "";
  const cover = resolveUrl(event.coverUrl);

  

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <button
          onClick={() => navigate("/admin")}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-700"
        >
          <ArrowLeft size={18} /> Voltar aos eventos
        </button>

        <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          {cover ? (
            <img
              src={cover}
              alt={`Capa de ${event.name}`}
              className="h-64 w-full object-cover sm:h-80"
              onError={(e) =>
                console.error("Erro ao carregar capa:", e.currentTarget.src)
              }
            />
          ) : (
            <div className="grid h-64 place-items-center bg-gray-100 text-gray-400">
              <Image size={40} />
            </div>
          )}

          <div className="p-6 sm:p-8">
            <p className="text-sm font-semibold text-blue-700">
              Detalhes do evento
            </p>
            <h1 className="mt-2 text-3xl font-bold">{event.name}</h1>

            <p className="mt-3 flex items-center gap-2 text-gray-500">
              <CalendarDays size={18} />
              {event.event_date || event.eventDate || "Data não informada"}
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "Fotos enviadas",
              value: stats.totalPhotos,
              icon: <Camera size={20} />,
            },
            {
              label: "Visitantes únicos",
              value: stats.uniqueVisitors,
              icon: <Users size={20} />,
            },
            {
              label: "Fotos em destaque",
              value: stats.featuredPhotos,
              icon: <Image size={20} />,
            },
          ].map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3 text-gray-500">
                {item.icon}
                <span className="text-sm">{item.label}</span>
              </div>
              <p className="mt-4 text-3xl font-bold">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold">Configurações</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div>
                <dt className="text-gray-500">Limite de fotos por convidado</dt>
                <dd className="mt-1 font-semibold">
                  {event.maxPhotosPerGuest ?? "Não informado"}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Limite de convidados</dt>
                <dd className="mt-1 font-semibold">
                  {event.maxGuests ?? "Sem limite definido"}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-bold">Compartilhar álbum</h2>

            {link ? (
              <>
                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block break-all text-sm text-blue-700 hover:underline"
                >
                  {link}
                </a>

                <div className="mt-5 inline-block rounded-xl border border-gray-200 p-3">
                  <QRCodeSVG value={link} size={160} />
                </div>

                <a
                  href={link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Abrir álbum <ExternalLink size={16} />
                </a>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-500">
                O evento não possui token público.
              </p>
            )}
          </article>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-bold">Fotos recebidas</h2>
          {session?.access_token && event && (
            <EventPhotos eventId={event.id} token={session.access_token} />
          )}
        </section>
      </div>
    </main>
  );
}
