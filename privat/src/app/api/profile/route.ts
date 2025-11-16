import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { requireUser } from '@/lib/request';

export async function GET(request: Request) {
  const user = await requireUser(request).catch(() => undefined);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.json({ user: store.sanitizeUser(user) });
}

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { name, status, avatar } = body ?? {};

    const updated = store.updateProfile(user.id, {
      name,
      status,
      avatar,
    });
    return NextResponse.json({ message: 'Profil diperbarui', user: updated });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui profil' }, { status: 500 });
  }
}
