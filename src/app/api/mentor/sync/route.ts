import { NextRequest, NextResponse } from 'next/server';
import { getSubscribers } from '@/lib/mentor-db';
import { requireSyncKey } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Returns the active subscriber list to trusted sibling apps (ai-master-mentor).
// Uses a shared MENTOR_SYNC_KEY instead of the admin password.
export async function GET(req: NextRequest) {
  if (!requireSyncKey(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const subscribers = await getSubscribers();
  return NextResponse.json(subscribers);
}
