export const VISITOR_NAME_KEY = "basedspeak:visitor-name:v1";

export function normalizeVisitorName(value: string): string {
  return value.normalize("NFC").replace(/\s+/gu, " ").trim();
}

export function visitorNameError(value: string): string | null {
  const name = normalizeVisitorName(value);
  if (!name) return "Digite como você quer ser chamado.";
  if (Array.from(name).length > 60) return "Use um nome com até 60 caracteres.";
  if (!/\p{L}/u.test(name) || /[<>\p{Cc}\p{Cf}]/u.test(name))
    return "Digite um nome válido.";
  return null;
}

export function readVisitorName(
  storage: Pick<Storage, "getItem">,
): string | null {
  try {
    const value = storage.getItem(VISITOR_NAME_KEY);
    return value && !visitorNameError(value)
      ? normalizeVisitorName(value)
      : null;
  } catch {
    return null;
  }
}

export function writeVisitorName(
  storage: Pick<Storage, "setItem">,
  value: string,
): boolean {
  if (visitorNameError(value)) return false;
  try {
    storage.setItem(VISITOR_NAME_KEY, normalizeVisitorName(value));
    return true;
  } catch {
    return false;
  }
}
