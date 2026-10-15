import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Heart, LoaderCircle } from "lucide-react";
import { supabase } from "../services/supabase";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (!data.session) {
        throw new Error("Não foi possível criar a sessão.");
      }

      return data.session;
    },
    onSuccess: () => navigate("/admin", { replace: true }),
  });

  function getLoginErrorMessage(error: Error) {
    if (error.message.includes("Invalid login credentials")) {
      return "E-mail ou senha incorretos. Verifique seus dados e tente novamente.";
    }

    if (error.message.includes("Email not confirmed")) {
      return "Seu e-mail ainda não foi confirmado.";
    }

    if (error.message.includes("Too many requests")) {
      return "Muitas tentativas de login. Aguarde um pouco e tente novamente.";
    }

    return "Não foi possível entrar. Tente novamente em instantes.";
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-lg shadow-gray-200/50 sm:p-8">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Camera size={23} strokeWidth={1.8} />
          </div>

          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">
            Seu Momento
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Bem-vindo de volta
          </h1>

          <p className="mt-2 text-sm leading-6 text-gray-500">
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
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
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
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          {login.isError && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {getLoginErrorMessage(login.error)}
            </p>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {login.isPending && (
              <LoaderCircle size={18} className="animate-spin" />
            )}
            {login.isPending ? "Entrando..." : "Entrar na plataforma"}
          </button>
        </form>

        <div className="mt-6 border-t border-gray-100 pt-5 text-center">
          <p className="text-xs leading-5 text-gray-500">
             Momentos especiais merecem ser lembrados.
          </p>

          
        </div>
      </section>
    </main>
  );
}
