import AppProviders from "@/app/AppProviders";

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AppProviders>
            <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 selection:text-slate-900">
                {children}
            </div>
        </AppProviders>
    );
}
