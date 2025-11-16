import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/request';
import { store } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { toId, kind, payload } = body ?? {};

    if (!toId || !kind) {
      return NextResponse.json({ error: 'Data sinyal tidak lengkap' }, { status: 400 });
    }

    store.enqueueSignal({
      fromId: user.id,
      toId,
      kind,
      payload,
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'Sinyal terkirim' });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal mengirim sinyal' }, { status: 400 });
  }
}
