import { redirect } from "next/navigation";

type Params = Record<string, string | string[] | undefined>;
export default async function FirstEncountersPage({ searchParams }: { searchParams: Promise<Params> }) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    if (["apresentacao", "retomar"].includes(key) && typeof value === "string") query.set(key, value);
  }
  redirect(query.size ? `/demo?${query}` : "/demo");
}
