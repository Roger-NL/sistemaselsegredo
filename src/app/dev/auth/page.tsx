"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { evaluateAuthGuard } from "@/lib/auth/route-guards";
import { ROUTES } from "@/lib/routes";

type RoleOption = "" | "student" | "admin";

const scenarioPaths = [
  ROUTES.auth.login,
  ROUTES.auth.signup,
  ROUTES.app.dashboard,
  ROUTES.app.profile,
  `${ROUTES.app.pillar}/1`,
  ROUTES.app.specialties,
  ROUTES.admin.dashboard,
  ROUTES.admin.users,
];

function readCookie(name: string): string {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[-[\]/{}()*+?.\\^$|]/g, "\\$&")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : "";
}

function writeCookie(name: string, value: string): void {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${
    60 * 60 * 24 * 7
  }`;
}

function removeCookie(name: string): void {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export default function DevAuthPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [pathname, setPathname] = useState(ROUTES.app.dashboard);
  const [token, setToken] = useState(() =>
    typeof window === "undefined" ? "" : readCookie("es_session_token")
  );
  const [role, setRole] = useState<RoleOption>(() =>
    typeof window === "undefined" ? "" : ((readCookie("es_user_role") as RoleOption) || "")
  );
  const [statusMessage, setStatusMessage] = useState("");

  const decision = useMemo(
    () => evaluateAuthGuard({ pathname, token: token || undefined, role }),
    [pathname, role, token]
  );

  const syncFromBrowserCookies = () => {
    setToken(readCookie("es_session_token"));
    setRole((readCookie("es_user_role") as RoleOption) || "");
    setStatusMessage("Cookies sincronizados com o navegador.");
  };

  const applyCookies = () => {
    if (token) {
      writeCookie("es_session_token", token);
    } else {
      removeCookie("es_session_token");
    }

    if (role) {
      writeCookie("es_user_role", role);
    } else {
      removeCookie("es_user_role");
    }

    setStatusMessage("Cookies de auth aplicados no navegador.");
  };

  const clearCookies = () => {
    removeCookie("es_session_token");
    removeCookie("es_user_role");
    setToken("");
    setRole("");
    setStatusMessage("Cookies de auth removidos do navegador.");
  };

  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
          Auth Lab
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Simulador isolado de guardas e redirecionamento
        </h2>
        <p className="max-w-3xl text-slate-300">
          Esta tela usa a mesma regra do `proxy` para prever exatamente o que
          acontece em cada rota, com ou sem sessao.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Estado simulado
          </h3>

          <div className="mt-4 space-y-4">
            <label className="block text-xs uppercase tracking-wider text-slate-400">
              Rota alvo
              <input
                value={pathname}
                onChange={(event) => setPathname(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                placeholder="/dashboard"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              {scenarioPaths.map((path) => (
                <button
                  key={path}
                  onClick={() => setPathname(path)}
                  className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-emerald-400 hover:text-white"
                >
                  {path}
                </button>
              ))}
            </div>

            <label className="block text-xs uppercase tracking-wider text-slate-400">
              Token de sessao
              <input
                value={token}
                onChange={(event) => setToken(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
                placeholder="ex: user_123 ou firebase_uid"
              />
            </label>

            <label className="block text-xs uppercase tracking-wider text-slate-400">
              Role
              <select
                value={role}
                onChange={(event) => setRole(event.target.value as RoleOption)}
                className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-emerald-400"
              >
                <option value="">(sem role)</option>
                <option value="student">student</option>
                <option value="admin">admin</option>
              </select>
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
            Decisao do guard
          </h3>

          <div className="mt-4 space-y-3 text-sm">
            <p className="text-slate-300">
              Resultado:{" "}
              <span
                className={
                  decision.allow ? "text-emerald-400 font-semibold" : "text-amber-300 font-semibold"
                }
              >
                {decision.allow ? "ALLOW" : "REDIRECT"}
              </span>
            </p>

            <p className="text-slate-400">
              Motivo: <span className="text-slate-200">{decision.reason}</span>
            </p>

            <p className="text-slate-400">
              Destino:{" "}
              <span className="text-slate-200">
                {decision.redirectTo || "(permanece na rota)"}
              </span>
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={applyCookies}
              className="rounded-lg border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-300"
            >
              Aplicar cookies
            </button>
            <button
              onClick={syncFromBrowserCookies}
              className="rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-200"
            >
              Sincronizar do navegador
            </button>
            <button
              onClick={clearCookies}
              className="rounded-lg border border-rose-500/60 bg-rose-500/10 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-rose-300"
            >
              Limpar cookies
            </button>
          </div>

          {statusMessage && <p className="mt-3 text-xs text-slate-400">{statusMessage}</p>}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Estado atual da sessao (AuthContext)
        </h3>

        <div className="mt-3 text-sm text-slate-300">
          <p>isLoading: {String(isLoading)}</p>
          <p>isAuthenticated: {String(isAuthenticated)}</p>
          <p>userId: {user?.id || "(nenhum)"}</p>
          <p>email: {user?.email || "(nenhum)"}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
        <h3 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
          Teste rapido em rotas reais
        </h3>

        <p className="mt-2 text-sm text-slate-400">
          Depois de aplicar cookies, clique em uma rota para validar o redirect
          real do `proxy`.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {scenarioPaths.map((path) => (
            <Link
              key={`goto-${path}`}
              href={path}
              className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200 hover:border-emerald-400 hover:text-white"
            >
              Ir para {path}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
