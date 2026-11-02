import { workspaceApi } from "@/server/workspace/http";
import { readJsonObject } from "@/server/http/request";
import { requireTestOwner } from "@/server/superuser/policy";
import { mutateTestProgress } from "@/server/superuser/service";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const preferredRegion = "iad1";
export async function GET(request:Request) {
  return workspaceApi(request,{},async principal=>{ await requireTestOwner(principal); return { available:true }; });
}
export async function POST(request:Request) {
  return workspaceApi(request,{write:true},async principal=>mutateTestProgress(principal,await readJsonObject(request,4096)));
}
