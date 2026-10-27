import { NextResponse } from "next/server";
import { getDashboardIdentity } from "@/server/dashboard/account";
import { getAdminDb } from "@/server/firebase";
import { assertOnlyKeys, readJsonObject, RequestPayloadError } from "@/server/http/request";

export async function PATCH(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin) {
    return NextResponse.json({ error: "Origem da solicitação inválida." }, { status: 403 });
  }
  const identity = await getDashboardIdentity();
  if (!identity) return NextResponse.json({ error: "Entre novamente para salvar seu nome." }, { status: 401 });

  try {
    const body = await readJsonObject(request, 2048);
    assertOnlyKeys(body, ["name"]);
    if (typeof body.name !== "string" || !body.name.trim() || body.name.trim().length > 120 || /[\u0000-\u001f\u007f]/.test(body.name)) {
      return NextResponse.json({ error: "Informe um nome com até 120 caracteres." }, { status: 400 });
    }
    const name = body.name.trim();
    await getAdminDb().collection("users").doc(identity.uid).update({ name, updatedAt: new Date().toISOString() });
    return NextResponse.json({ name });
  } catch (error) {
    if (error instanceof RequestPayloadError) {
      return NextResponse.json({ error: "Não foi possível ler o nome informado." }, { status: error.status });
    }
    return NextResponse.json({ error: "Não foi possível salvar seu nome. Tente novamente." }, { status: 500 });
  }
}
