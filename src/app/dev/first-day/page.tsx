import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { notFound } from "next/navigation";
import { FirstDay } from "@/features/first-day/FirstDay";
import { localToolsAllowed } from "@/features/local-testing/environment";
import { firstDayPreviewCookie, hasFirstDayPreviewAccess } from "@/lib/first-day-preview";

export const metadata: Metadata = {
  title: "First Day · Protótipo",
  robots: { index: false, follow: false },
};

export default async function FirstDayPage() {
  const requestHeaders = await headers();
  if (!localToolsAllowed(requestHeaders.get("host") ?? "")) {
    const cookie = (await cookies()).get(firstDayPreviewCookie)?.value;
    if (!hasFirstDayPreviewAccess(cookie)) notFound();
  }
  return <FirstDay />;
}
