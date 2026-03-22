import Link from "next/link";

const labLinks = [
  { href: "/dev", label: "Hub" },
  { href: "/dev/auth", label: "Auth" },
  { href: "/dev/modals", label: "Modais" },
  { href: "/dev/forms", label: "Forms" },
  { href: "/dev/pages", label: "Pages" },
];

export default function DevLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-6 py-4">
          <div className="mr-4">
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">
              BasedSpeak Lab
            </p>
            <h1 className="text-lg font-semibold text-white">
              Ambiente isolado de validacao
            </h1>
          </div>

          <nav className="flex flex-wrap gap-2">
            {labLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-slate-700 px-3 py-1.5 text-sm text-slate-300 transition hover:border-emerald-400 hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
