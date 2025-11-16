import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { requireUser } from '@/lib/request';

export async function PUT(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { privacy } = body ?? {};
    if (!privacy || !['public', 'friends', 'private'].includes(privacy)) {
      return NextResponse.json({ error: 'Privasi tidak valid' }, { status: 400 });
    }
    const updated = store.updatePrivacy(user.id, privacy);
    return NextResponse.json({ message: 'Privasi diperbarui', user: updated });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal memperbarui privasi' }, { status: 500 });
  }
}
