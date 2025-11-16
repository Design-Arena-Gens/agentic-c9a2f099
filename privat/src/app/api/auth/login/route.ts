import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { createAuthToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, password } = body ?? {};

    if (!userId || !password) {
      return NextResponse.json({ error: 'ID dan password wajib diisi' }, { status: 400 });
    }

    const user = store.getUserInternal(userId);
    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const valid = await store.verifyPassword(userId, password);
    if (!valid) {
      return NextResponse.json({ error: 'Password salah' }, { status: 401 });
    }

    const token = await createAuthToken(user.id);
    store.addSession(token, user.id);

    const response = NextResponse.json({
      message: 'Login berhasil',
      user: store.sanitizeUser(user),
    });

    response.cookies.set({
      name: 'privat-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat login' }, { status: 500 });
  }
}
