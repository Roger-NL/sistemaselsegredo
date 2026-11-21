import type { Metadata } from "next";
import { FirstDay } from "@/features/first-day/FirstDay";

export const metadata: Metadata = {
  title: "First Day · Protótipo",
  robots: { index: false, follow: false },
};

export default function FirstDayPage() {
  return <FirstDay />;
}
