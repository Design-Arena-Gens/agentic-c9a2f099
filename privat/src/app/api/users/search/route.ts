import { NextResponse } from 'next/server';
import { store } from '@/lib/store';
import { requireUser } from '@/lib/request';

export async function GET(request: Request) {
  try {
    await requireUser(request);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query')?.toUpperCase() ?? '';
  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const results = store.listUsers()
    .filter((user) => user.id.includes(query) || user.name.toUpperCase().includes(query));

  return NextResponse.json({ results });
}
