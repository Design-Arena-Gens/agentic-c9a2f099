import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { requireUser } from '@/lib/request';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);
    const friends = Array.from(user.friends).map((friendId) => {
      const friend = store.getUserInternal(friendId);
      if (!friend) return undefined;
      return store.sanitizeUser(friend);
    }).filter(Boolean);

    return NextResponse.json({ friends });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal memuat teman' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { friendId } = body ?? {};
    if (!friendId) {
      return NextResponse.json({ error: 'ID teman wajib diisi' }, { status: 400 });
    }
    const result = store.addFriend(user.id, friendId);
    return NextResponse.json({
      message: 'Teman berhasil ditambahkan',
      data: result,
    });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
