import { retiredApiResponse } from "@/server/http/retired";

export const dynamic = "force-dynamic";
export function GET() { return retiredApiResponse(); }
