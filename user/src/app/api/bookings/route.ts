import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server-utils';
import {
  createBookingDrafts,
  getUserBookings,
} from '@/lib/rental-service';
import { bookingDraftSchema, getValidationErrorMessage } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));

    const bookings = await getUserBookings(user.id, status);
    const total = bookings.length;
    const start = (page - 1) * limit;
    const data = bookings.slice(start, start + limit);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Bookings GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = bookingDraftSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getValidationErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const result = await createBookingDrafts({
      userId: user.id,
      items: parsed.data.items,
      deliveryMethod: parsed.data.deliveryMethod,
      deliveryAddressId: parsed.data.deliveryAddressId || undefined,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: result.status });
  } catch (error) {
    console.error('Bookings POST error:', error);
    return NextResponse.json({ error: 'Failed to create booking drafts' }, { status: 500 });
  }
}
