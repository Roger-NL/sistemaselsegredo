import StudentDetailPage from "@/features/admin/StudentDetailPage";

export default async function AdminUserDetailRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <StudentDetailPage studentId={id} />;
}
