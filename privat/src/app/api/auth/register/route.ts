import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { createAuthToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, password } = body ?? {};

    if (!name || !password) {
      return NextResponse.json({ error: 'Nama dan password wajib diisi' }, { status: 400 });
    }

    const user = await store.register(name, password);
    const token = await createAuthToken(user.id);
    store.addSession(token, user.id);

    const response = NextResponse.json({
      userId: user.id,
      message: 'Registrasi berhasil',
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
    return NextResponse.json({ error: 'Terjadi kesalahan saat registrasi' }, { status: 500 });
  }
}
