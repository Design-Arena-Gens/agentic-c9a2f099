import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/request';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    await requireAdmin(request);
    const groups = store.listAllGroups();
    return NextResponse.json({ groups });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as Error).message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Gagal memuat data grup' }, { status: 500 });
  }
}
