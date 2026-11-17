import { retiredApiResponse } from "@/server/http/retired";

export const dynamic = "force-dynamic";
// New lesson audio is served from its immutable, pre-generated local media.
export function GET() { return retiredApiResponse(); }
export function POST() { return retiredApiResponse(); }
