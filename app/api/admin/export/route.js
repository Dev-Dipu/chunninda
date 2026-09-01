import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { getAllSubscribers } from '@/lib/db';

export async function GET(request) {
  const authed = await isAuthenticated(request);
  if (!authed) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const subscribers = await getAllSubscribers();

  // Generate CSV rows
  const headers = ['ID', 'Email', 'Subscription Date', 'Time', 'Email Notification Sent', 'User Agent'];
  const rows = subscribers.map((sub) => [
    `"${sub.id || ''}"`,
    `"${(sub.email || '').replace(/"/g, '""')}"`,
    `"${sub.formattedDate || (sub.createdAt ? sub.createdAt.slice(0, 10) : '')}"`,
    `"${sub.formattedTime || ''}"`,
    `"${sub.emailSent ? 'Yes' : 'No'}"`,
    `"${(sub.userAgent || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const filename = `chunniindia_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
