import { redirect } from "next/navigation";

/** Compatibility only. The lesson guards practice before theory and test. */
export default function StudyPage() { redirect("/demo?retomar=conclusao"); }
