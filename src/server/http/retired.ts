import { NextResponse } from "next/server";

export function retiredApiResponse() {
  return NextResponse.json({ error: "API_RETIRED", message: "Este recurso foi aposentado." }, {
    status: 410, headers: { "Cache-Control": "no-store" },
  });
}
