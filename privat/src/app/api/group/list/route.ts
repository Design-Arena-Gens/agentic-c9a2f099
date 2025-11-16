import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/request';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const groups = store.listGroupsForUser(user.id);
    return NextResponse.json({ groups });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal memuat grup' }, { status: 500 });
  }
}
