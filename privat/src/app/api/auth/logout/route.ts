import { NextResponse } from 'next/server';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  const token = request.headers.get('cookie')?.match(/privat-token=([^;]+)/)?.[1];
  if (token) {
    store.removeSession(token);
  }

  const response = NextResponse.json({ message: 'Logout berhasil' });
  response.cookies.set({
    name: 'privat-token',
    value: '',
    path: '/',
    maxAge: 0,
  });
  return response;
}
