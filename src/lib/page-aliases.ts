// Explicit page aliases from docs/plano-nova-demo/ROTAS.csv. Unknown URLs are not aliases.
export const retiredPagePatterns = [
  /^\/login$/,
  /^\/cadastro$/,
  /^\/pagamento$/,
  /^\/obrigado$/,
  /^\/agendamentos$/,
  /^\/boletim$/,
  /^\/configuracoes$/,
  /^\/especialidades$/,
  /^\/especialidades\/[^\/]+$/,
  /^\/especialidades\/[^\/]+\/modulo\/[^\/]+$/,
  /^\/perfil$/,
  /^\/pilar\/[^\/]+$/,
  /^\/admin\/dashboard$/,
  /^\/admin\/analytics$/,
  /^\/admin\/aprovacoes$/,
  /^\/admin\/codigos$/,
  /^\/admin\/usuarios$/,
  /^\/admin\/usuarios\/[^\/]+$/,
  /^\/admin\/agendamentos$/,
  /^\/admin\/alunos\/[^\/]+$/,
  /^\/inicio\-orbita\-7k3$/,
] as const;

export function isRetiredPage(pathname: string) {
  return retiredPagePatterns.some(pattern => pattern.test(pathname));
}
