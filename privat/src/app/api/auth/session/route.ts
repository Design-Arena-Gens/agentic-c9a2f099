import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { verifyAuthToken } from '@/lib/auth';

export async function GET(request: Request) {
  const token = request.headers.get('cookie')?.match(/privat-token=([^;]+)/)?.[1];
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const session = store.getSession(token);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const userId = await verifyAuthToken(token);
  if (!userId) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  const user = store.getUserInternal(userId);
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }

  return NextResponse.json({
    authenticated: true,
    user: store.sanitizeUser(user),
  });
}
