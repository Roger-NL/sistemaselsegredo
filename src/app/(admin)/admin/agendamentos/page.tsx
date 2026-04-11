import AdminSchedulingPageClient from "@/features/admin/AdminSchedulingPageClient";
import { getAdminSchedulingSnapshot } from "@/lib/scheduling/service";

export const dynamic = "force-dynamic";

export default async function AdminSchedulingPage() {
  const snapshot = await getAdminSchedulingSnapshot();
  return <AdminSchedulingPageClient initialSnapshot={snapshot} />;
}
