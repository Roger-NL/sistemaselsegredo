import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { retiredPagePatterns } from "@/lib/page-aliases";
import * as exams from "@/app/api/exams/route";
import * as decision from "@/app/api/admin/exams/decision/route";
import * as leaderboard from "@/app/api/leaderboard/route";
import * as progress from "@/app/api/progress/route";
import * as heartbeat from "@/app/api/study/heartbeat/route";
import * as speech from "@/app/api/speech/route";

const pages = ["/login", "/cadastro", "/pagamento", "/obrigado", "/agendamentos", "/boletim", "/configuracoes", "/especialidades", "/especialidades/test", "/especialidades/test/modulo/test", "/perfil", "/pilar/2", "/admin/dashboard", "/admin/analytics", "/admin/aprovacoes", "/admin/codigos", "/admin/usuarios", "/admin/usuarios/test", "/admin/agendamentos", "/admin/alunos/test", "/inicio-orbita-7k3"];
describe("explicit retired page destinations", () => {
  it("covers the 21 remaining aliases as 307 and discards sensitive queries", () => {
    expect(retiredPagePatterns).toHaveLength(pages.length);
    for (const page of pages) {
      const response = proxy(new NextRequest(`http://localhost${page}?callbackUrl=/admin&paymentId=test&token=test`));
      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost/");
    }
  });
  it("allows public pages, assets, all APIs and unknown paths through without redirecting", () => {
    for (const path of ["/", "/dashboard", "/demo", "/termos", "/privacidade", "/manifest.webmanifest", "/robots.txt", "/sitemap.xml", "/favicon.ico", "/demo/cafe/v1/audio/C01.mp3", "/api/checkout", "/api/admin/scheduling/day", "/api/unknown", "/dashboard-public", "/admin/unknown", "/unknown", "/especialidades/test/unknown"]) {
      const response = proxy(new NextRequest(`http://localhost${path}`));
      expect(response.headers.get("location")).toBeNull();
      expect(response.headers.get("x-middleware-next")).toBe("1");
    }
  });
});

describe("six retired APIs", () => {
  for (const [name, module, method] of [["exams", exams, "POST"], ["decision", decision, "POST"], ["leaderboard", leaderboard, "GET"], ["progress", progress, "POST"], ["heartbeat", heartbeat, "POST"], ["speech", speech, "GET"]] as const) {
    it(`${name} retains its method and returns JSON 410 without an HTML destination`, async () => {
      const handler = (module as Record<string, unknown>)[method] as () => Response;
      const response = handler();
      expect(response.status).toBe(410);
      expect(response.headers.get("content-type")).toContain("application/json");
      expect(response.headers.get("location")).toBeNull();
      expect(await response.json()).toMatchObject({ error: "API_RETIRED" });
      for (const unsupported of ["GET", "POST", "PUT", "PATCH", "DELETE"].filter(m => m !== method)) expect((module as Record<string, unknown>)[unsupported]).toBeUndefined();
    });
  }
});
