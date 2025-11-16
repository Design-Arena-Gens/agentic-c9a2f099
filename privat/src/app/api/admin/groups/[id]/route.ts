import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/request';
import { store } from '@/lib/store';

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin(request);
    const { id } = await context.params;
    store.deleteGroup(id);
    return NextResponse.json({ message: 'Grup dihapus' });
  } catch (error) {
    if ((error as Error).message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if ((error as Error).message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 400 });
  }
}
