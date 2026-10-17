import { describe, expect, it } from "vitest";
import {
  normalizeVisitorName,
  visitorNameError,
  readVisitorName,
  writeVisitorName,
  VISITOR_NAME_KEY,
} from "../src/lib/welcome/visitor-name";

describe("remembered visitor name", () => {
  it("stores the normalized name and reads edits on the next visit", () => {
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        data.set(key, value);
      },
    };
    expect(readVisitorName(storage)).toBeNull();
    expect(writeVisitorName(storage, "  João   d’Ávila  ")).toBe(true);
    expect(data.get(VISITOR_NAME_KEY)).toBe("João d’Ávila");
    expect(readVisitorName(storage)).toBe("João d’Ávila");
    expect(writeVisitorName(storage, "Bia")).toBe(true);
    expect(readVisitorName(storage)).toBe("Bia");
    expect(writeVisitorName(storage, " ")).toBe(false);
    expect(readVisitorName(storage)).toBe("Bia");
  });

  it("handles blocked storage and untrusted stored values without throwing", () => {
    const blocked = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("quota");
      },
    };
    expect(readVisitorName(blocked)).toBeNull();
    expect(writeVisitorName(blocked, "Ana")).toBe(false);
    expect(readVisitorName({ getItem: () => "<script>" })).toBeNull();
    expect(readVisitorName({ getItem: () => "x".repeat(61) })).toBeNull();
  });

  it("accepts international names and rejects blank or oversized values", () => {
    for (const name of ["李", "Éva", "Anne-Marie", "D’Arcy", "أحمد"])
      expect(visitorNameError(name)).toBeNull();
    for (const name of ["", "  ", "123", "<Ana>", "A".repeat(61)])
      expect(visitorNameError(name)).not.toBeNull();
    expect(normalizeVisitorName(" E\u0301va ")).toBe("Éva");
  });
});
