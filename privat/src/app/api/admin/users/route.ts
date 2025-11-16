import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/request';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const users = store.listUsers();
    return NextResponse.json({ users });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as Error).message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Gagal memuat data user' }, { status: 500 });
  }
}
