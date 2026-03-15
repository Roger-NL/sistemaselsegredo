export const ROUTES = {
  home: "/",
  auth: {
    login: "/login",
    signup: "/cadastro",
  },
  public: {
    payment: "/pagamento",
  },
  app: {
    dashboard: "/dashboard",
    boletim: "/boletim",
    settings: "/configuracoes",
    specialties: "/especialidades",
    profile: "/perfil",
    pillar: "/pilar",
    thankYou: "/obrigado",
  },
  admin: {
    root: "/admin",
    dashboard: "/admin/dashboard",
    analytics: "/admin/analytics",
    approvals: "/admin/aprovacoes",
    users: "/admin/usuarios",
    codes: "/admin/codigos",
  },
} as const;

export function adminUserDetailPath(id: string): string {
  return `${ROUTES.admin.users}/${id}`;
}

export function legacyAdminStudentDetailPath(id: string): string {
  return `${ROUTES.admin.root}/alunos/${id}`;
}

export const AUTH_ENTRY_ROUTE_PREFIXES = [ROUTES.auth.login, ROUTES.auth.signup];

export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.app.dashboard,
  ROUTES.app.boletim,
  ROUTES.app.settings,
  ROUTES.app.specialties,
  ROUTES.app.profile,
  ROUTES.app.pillar,
  ROUTES.app.thankYou,
];

export const ADMIN_ROUTE_PREFIXES = [ROUTES.admin.root];

export function isSafeInternalCallbackPath(path: string): boolean {
  if (!path.startsWith("/") || path.startsWith("//")) {
    return false;
  }

  if (AUTH_ENTRY_ROUTE_PREFIXES.some((authPath) => path === authPath)) {
    return false;
  }

  return true;
}
