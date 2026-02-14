"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
    LayoutDashboard, 
    Users, 
    Key, 
    BarChart3, 
    LogOut, 
    ShieldAlert,
    Menu,
    X
} from "lucide-react";

// ADMIN LIST (Hardcoded for MVP Phase - will move to Claims later)
const ADMIN_EMAILS = ["roger@esacademy.com", "admin@esacademy.com", "raugerac@gmail.com"]; 

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    // Security Check
    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push("/login");
                return;
            }
            // Simple Email Check for MVP
            if (user && !ADMIN_EMAILS.includes(user.email)) {
                router.push("/dashboard"); // Kick regular users out
            }
        }
    }, [isAuthenticated, isLoading, user, router]);

    if (isLoading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-slate-900 border-t-transparent rounded-full"></div>
        </div>
    );

    // If not admin (and effect hasn't redirected yet), hide content
    if (user && !ADMIN_EMAILS.includes(user.email)) return null;

    const navItems = [
        { name: "Visão Geral", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Aprovações", href: "/admin/aprovacoes", icon: ShieldAlert },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
        { name: "Alunos", href: "/admin/usuarios", icon: Users },
        { name: "Códigos de Acesso", href: "/admin/codigos", icon: Key },
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                lg:relative lg:translate-x-0 flex flex-col
            `}>
                <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="w-6 h-6 text-emerald-400" />
                        <span className="font-bold tracking-tight">ES Admin</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navItems.map((item) => {
                        // Check if path includes the item href (for active state)
                        // Note: Admin routes are /dashboard, /codigos etc. but they are inside (admin) group.
                        // Wait, the path inside (admin) maps to root URL if not handled carefully?
                        // Actually, Next.js routes inside (admin) usually need folder names.
                        // I created folders: /dashboard, /usuarios inside (admin).
                        // So the URL will be /dashboard? NO.
                        // If I have src/app/(admin)/dashboard/page.tsx -> URL is /dashboard.
                        // BUT /dashboard is ALREADY taken by (authenticated)/dashboard!
                        
                        // CRITICAL FIX: I need to rename the folders in (admin) to avoid collision.
                        // Suggestion: /admin/dashboard, /admin/users.
                        // So I should move files to src/app/(admin)/admin/dashboard...
                        
                        // For now, let's assume I will fix the folder structure in the next step.
                        // I will use href="/admin/..." logic.
                        
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link 
                                key={item.href} 
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors
                                    ${isActive 
                                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/20" 
                                        : "text-slate-400 hover:bg-slate-800 hover:text-white"}
                                `}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="flex items-center gap-3 px-4 py-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                            {user?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-slate-500 truncate">Admin</p>
                        </div>
                    </div>
                    <Link 
                        href="/dashboard"
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors mb-1"
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Voltar ao Site
                    </Link>
                    <button 
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Sair
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden bg-white border-b border-slate-200 p-4 flex items-center gap-4">
                    <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="font-bold text-slate-900">Painel Administrativo</span>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
