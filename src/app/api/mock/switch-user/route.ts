import { NextRequest, NextResponse } from 'next/server';
import { setCurrentUserId } from '@/mock/mock-context';

export async function POST(req: NextRequest) {
  if (process.env.NEXT_PUBLIC_MOCK_API !== 'true') {
    return NextResponse.json({ error: 'Not in mock mode' }, { status: 403 });
  }

  const { userId } = await req.json();
  setCurrentUserId(userId);

  return NextResponse.json({ ok: true });
}
