import { cookies } from 'next/headers';

export async function getRequestUserContext() {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get('es_session_token')?.value;
  const role = cookieStore.get('es_user_role')?.value || 'student';
  return {
    sessionUserId,
    isAdmin: role === 'admin',
  };
}
