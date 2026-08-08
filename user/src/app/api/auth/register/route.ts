import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getValidationErrorMessage, registerSchema } from '@/lib/validation';

export async function POST(req: Request) {
  try {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getValidationErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password, phone } = parsed.data;

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      phone,
    });

    return NextResponse.json(
      {
        success: true,
        user: { id: user._id.toString(), name: user.name, email: user.email },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
