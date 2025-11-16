import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/request';
import { eventHub } from '@/lib/eventHub';
import { store } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const user = await requireUser(request);

    const { stream, close } = eventHub.subscribe(user.id);

    const response = new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });

    const userInfo = store.sanitizeUser(user);
    eventHub.broadcast(user.id, {
      type: 'system',
      message: 'Terhubung ke notifikasi',
      timestamp: new Date().toISOString(),
      data: { user: userInfo },
    });

    response.headers.set('X-Accel-Buffering', 'no');
    request.signal.addEventListener('abort', () => close());
    return response;
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Gagal membuka stream' }, { status: 500 });
  }
}
