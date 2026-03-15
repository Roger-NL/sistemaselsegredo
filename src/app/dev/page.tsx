import Link from "next/link";

const labs = [
  {
    href: "/dev/auth",
    title: "Auth Lab",
    description: "Fluxos isolados de login, sessao, guardas e redirecionamentos.",
  },
  {
    href: "/dev/modals",
    title: "Modal Lab",
    description: "Montagem dedicada para validar modais e overlays sem navegar pelo sistema.",
  },
  {
    href: "/dev/forms",
    title: "Form Lab",
    description: "Espaco para testes de formularios, estados de erro, loading e sucesso.",
  },
  {
    href: "/dev/pages",
    title: "Page Lab",
    description: "Sandbox para telas candidatas a refatoracao antes da integracao real.",
  },
];

export default function DevHomePage() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
          Fase 1
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Laboratorio oficial do projeto
        </h2>
        <p className="max-w-3xl text-base text-slate-300">
          Toda mudanca sensivel deve nascer aqui antes de tocar nas rotas
          principais. Assim a gente valida comportamento, UI e fluxo em um
          ambiente local isolado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {labs.map((lab) => (
          <Link
            key={lab.href}
            href={lab.href}
            className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition hover:border-emerald-400/70 hover:bg-slate-900"
          >
            <h3 className="text-xl font-medium text-white">{lab.title}</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              {lab.description}
            </p>
            <span className="mt-6 inline-block text-sm font-medium text-emerald-400">
              Abrir laboratorio
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
