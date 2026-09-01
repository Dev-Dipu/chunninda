import { NextResponse } from 'next/server';
import { isAuthenticated } from '@/lib/auth';
import { sendWelcomeEmail, getWelcomeEmailHtml } from '@/lib/mail';

export async function POST(request) {
  const authed = await isAuthenticated(request);
  if (!authed) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ success: false, error: 'Target email is required' }, { status: 400 });
    }

    const result = await sendWelcomeEmail(email);
    return NextResponse.json({
      success: result.success,
      simulated: result.simulated || false,
      message: result.simulated
        ? 'Email simulated! (Configure SMTP in .env.local for real sending)'
        : 'Live test email dispatched successfully!',
      details: result
    });
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request) {
  const authed = await isAuthenticated(request);
  if (!authed) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const html = getWelcomeEmailHtml('patron@example.com');
  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8'
    }
  });
}
