import { NextResponse } from 'next/server';
import { checkPassword, generateSessionToken } from '@/lib/auth';

export async function POST(request) {
  try {
    const { password } = await request.json();

    if (!password || !checkPassword(password)) {
      return NextResponse.json(
        { success: false, error: 'Incorrect administrator password.' },
        { status: 401 }
      );
    }

    const token = generateSessionToken();
    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.'
    });

    response.cookies.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
