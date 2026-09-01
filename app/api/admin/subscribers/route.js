import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllSubscribers, deleteSubscriber, getSubscriberStats } from '@/lib/db';

export async function GET(request) {
  const authed = await isAuthenticated(request);
  if (!authed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = (searchParams.get('search') || '').toLowerCase().trim();

  let list = await getAllSubscribers();
  const stats = await getSubscriberStats();

  if (search) {
    list = list.filter((s) => s.email.toLowerCase().includes(search));
  }

  return NextResponse.json({
    success: true,
    subscribers: list,
    stats,
  });
}

export async function DELETE(request) {
  const authed = await isAuthenticated(request);
  if (!authed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing subscriber ID' }, { status: 400 });
    }

    const result = await deleteSubscriber(id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
