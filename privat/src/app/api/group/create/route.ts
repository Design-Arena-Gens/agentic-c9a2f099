import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/request';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { name } = body ?? {};
    if (!name) {
      return NextResponse.json({ error: 'Nama grup wajib diisi' }, { status: 400 });
    }
    const group = store.createGroup(user.id, name);
    return NextResponse.json({
      message: 'Grup berhasil dibuat',
      group,
    });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
