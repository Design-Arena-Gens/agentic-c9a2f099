import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { requireUser } from '@/lib/request';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const peerId = searchParams.get('peerId');

    if (!type || !peerId || !['private', 'group'].includes(type)) {
      return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
    }

    const messages = store.getConversation(user.id, type as 'private' | 'group', peerId);
    return NextResponse.json({ messages });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
