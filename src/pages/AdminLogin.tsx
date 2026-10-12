
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const login = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.session) {
        throw new Error('Não foi possível criar a sessão.');
      }

      return data.session;
    },
    onSuccess: () => navigate('/admin', { replace: true }),
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-500/15 text-2xl text-blue-400">
            ♡
          </div>

          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-blue-400">
            Wedding Drive Album
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Bem-vindo de volta
          </h1>

          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Entre para gerenciar seus eventos e suas fotos.
          </p>
        </div>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate();
          }}
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-zinc-200"
            >
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha"
              className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none transition placeholder:text-zinc-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {login.isError && (
            <p
              role="alert"
              className="rounded-lg border border-red-900 bg-red-950/50 p-3 text-sm text-red-300"
            >
              {login.error.message}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login.isPending ? 'Entrando...' : 'Entrar na plataforma'}
          </button>
        </form>

        <div className="mt-6 border-t border-zinc-800 pt-5 text-center">
          <p className="text-sm text-zinc-500">
            A conta administrativa precisa estar cadastrada no Supabase.
          </p>
          <Link
            to="/evento/exemplo"
            className="mt-4 inline-block text-sm font-medium text-blue-400 transition hover:text-blue-300"
          >
            Ver área dos convidados →
          </Link>
        </div>
      </section>
    </main>
  );
}
