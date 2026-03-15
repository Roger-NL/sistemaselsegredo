import { redirect } from "next/navigation";
import { adminUserDetailPath } from "@/lib/routes";

export default async function LegacyAdminStudentDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  redirect(adminUserDetailPath(id));
}
