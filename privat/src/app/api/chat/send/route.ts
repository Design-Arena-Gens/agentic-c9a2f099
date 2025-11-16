import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { requireUser } from '@/lib/request';

export async function POST(request: Request) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const {
      conversationType,
      recipientId,
      messageType,
      content,
      fileName,
    } = body ?? {};

    if (!conversationType || !['private', 'group'].includes(conversationType)) {
      return NextResponse.json({ error: 'Jenis percakapan tidak valid' }, { status: 400 });
    }
    if (!recipientId) {
      return NextResponse.json({ error: 'ID tujuan wajib diisi' }, { status: 400 });
    }
    if (!messageType || !['text', 'image', 'file'].includes(messageType)) {
      return NextResponse.json({ error: 'Jenis pesan tidak valid' }, { status: 400 });
    }
    if (!content) {
      return NextResponse.json({ error: 'Konten pesan kosong' }, { status: 400 });
    }

    const message = store.sendMessage(
      user.id,
      conversationType,
      recipientId,
      messageType,
      content,
      fileName,
    );

    return NextResponse.json({
      message: 'Pesan terkirim',
      data: {
        ...message,
        createdAt: message.createdAt.toISOString(),
      },
    });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
