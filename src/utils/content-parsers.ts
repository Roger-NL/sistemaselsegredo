export const splitOutsideTranslatable = (text: string, delimiter = "|"): string[] => {
  if (typeof text !== "string" || !text.length) return [""];

  const parts: string[] = [];
  let current = "";
  let i = 0;
  let depth = 0;

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === "{" && next === "{") {
      depth += 1;
      current += "{{";
      i += 2;
      continue;
    }

    if (ch === "}" && next === "}" && depth > 0) {
      depth -= 1;
      current += "}}";
      i += 2;
      continue;
    }

    if (ch === delimiter && depth === 0) {
      parts.push(current);
      current = "";
      i += 1;
      continue;
    }

    current += ch;
    i += 1;
  }

  parts.push(current);
  return parts;
};

export const parseQuizContent = (
  raw: string
): { question: string; options: string[]; answer: number } => {
  const parts = splitOutsideTranslatable(raw, "|").map((p) => p.trim());
  if (parts.length < 3) return { question: raw, options: [], answer: 0 };

  const question = parts[0];
  const last = parts[parts.length - 1];
  const answer = Number.isFinite(parseInt(last, 10)) ? parseInt(last, 10) : 0;

  // Backward-compat format: question|opt1,opt2,opt3|1
  if (parts.length === 3) {
    const options = splitOutsideTranslatable(parts[1], ",").map((o) => o.trim()).filter(Boolean);
    return { question, options, answer };
  }

  // New format: question|opt1|opt2|opt3|1
  return {
    question,
    options: parts.slice(1, -1).map((o) => o.trim()).filter(Boolean),
    answer,
  };
};
