export type DashboardAccount = { name: string; email: string };

export function displayAccountName(value: unknown): string {
  if (typeof value !== "string") return "";
  const name = value.trim().slice(0, 120);
  return name && name.toLocaleLowerCase("pt-BR") !== "usuário" ? name : "";
}
