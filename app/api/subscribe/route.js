import { NextResponse } from 'next/server';
import { addSubscriber, updateSubscriberEmailStatus } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/mail';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const userAgent = request.headers.get('user-agent') || '';
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';

    const result = await addSubscriber(email, { userAgent, ip });

    if (!result.success) {
      if (result.duplicate) {
        return NextResponse.json(
          {
            success: false,
            duplicate: true,
            message: "You're already on our exclusive launch list! We'll keep you posted."
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to subscribe.' },
        { status: 400 }
      );
    }

    // Trigger welcome email
    let emailResult = { simulated: true };
    try {
      emailResult = await sendWelcomeEmail(result.subscriber.email);
      await updateSubscriberEmailStatus(
        result.subscriber.id,
        emailResult.success,
        emailResult.simulated ? 'simulated' : emailResult.messageId || ''
      );
    } catch (mailErr) {
      console.error('Failed to trigger welcome email:', mailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for subscribing! We've sent a welcome note to your email.",
      subscriber: {
        id: result.subscriber.id,
        email: result.subscriber.email,
        emailSent: emailResult.success
      }
    });
  } catch (error) {
    console.error('Subscription error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
