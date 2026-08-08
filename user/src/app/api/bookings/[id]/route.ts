import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server-utils';
import {
  getUserBookings,
  updateBookingLifecycle,
} from '@/lib/rental-service';
import { bookingActionSchema, getValidationErrorMessage } from '@/lib/validation';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const bookings = await getUserBookings(user.id);
    const booking = bookings.find((entry: any) => entry.id === id);

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking });
  } catch (error) {
    console.error('Bookings GET by id error:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = bookingActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getValidationErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    const result = await updateBookingLifecycle({
      bookingId: id,
      userId: user.id,
      action: parsed.data.action,
      returnCondition: parsed.data.returnCondition,
      damageNotes: parsed.data.damageNotes,
      missingAccessories: parsed.data.missingAccessories,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: result.status });
  } catch (error) {
    console.error('Bookings PUT error:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

