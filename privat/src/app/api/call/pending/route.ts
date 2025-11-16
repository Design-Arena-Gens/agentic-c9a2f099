import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/request';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const signals = store.consumeSignals(user.id);
    return NextResponse.json({ signals });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal memuat sinyal' }, { status: 500 });
  }
}
