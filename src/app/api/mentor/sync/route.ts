import { NextRequest, NextResponse } from 'next/server';
import { getSubscribers } from '@/lib/mentor-db';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Returns the active subscriber list to trusted sibling apps (ai-master-mentor).
// Uses a shared MENTOR_SYNC_KEY instead of the admin password.
export async function GET(req: NextRequest) {
  const key = req.headers.get('x-sync-key') ?? '';
  const correct = (process.env.MENTOR_SYNC_KEY ?? '').trim();

  if (!correct || key.trim() !== correct) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscribers = await getSubscribers();
  return NextResponse.json(subscribers);
}
