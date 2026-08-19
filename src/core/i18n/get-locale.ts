import { cookies } from 'next/headers';

export async function getLocale() {
  const cookieLocale = (await cookies()).get('locale')?.value;

  // TODO: nếu có auth server-side thì lấy user.language ở đây
  // const user = await getUser()
  // if (user?.language) return user.language

  return cookieLocale || 'vi';
}
