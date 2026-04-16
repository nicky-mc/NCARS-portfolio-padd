import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { uid, action } = await request.json();
  const cookieStore = await cookies();

  if (action === 'login') {
    cookieStore.set('ncars_auth', uid, {
      httpOnly: true,
      secure: true, // Must be true for SameSite=None
      sameSite: 'none', // Required for iframe environments like AI Studio
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    return NextResponse.json({ status: 'Authorized' });
  }

  if (action === 'logout') {
    cookieStore.delete('ncars_auth');
    return NextResponse.json({ status: 'Logged Out' });
  }

  return NextResponse.json({ status: 'Invalid Action' }, { status: 400 });
}
