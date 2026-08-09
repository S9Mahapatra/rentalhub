import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server-utils';
import {
  createRentalCheckoutOrder,
  getUserOrders,
} from '@/lib/rental-service';
import { checkoutSchema, getValidationErrorMessage } from '@/lib/validation';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || undefined;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10', 10));

    const orders = await getUserOrders(user.id, status);
    const total = orders.length;
    const start = (page - 1) * limit;

    return NextResponse.json({
      success: true,
      data: orders.slice(start, start + limit),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Orders GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getValidationErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    // Online orders must go through /api/payments/cashfree/create so the order
    // is never confirmed without a verified payment.
    if (parsed.data.paymentMode === 'online') {
      return NextResponse.json(
        { error: 'Use the Cashfree payment flow for online orders' },
        { status: 400 }
      );
    }

    const result = await createRentalCheckoutOrder({
      userId: user.id,
      items: parsed.data.items,
      deliveryMethod: parsed.data.deliveryMethod,
      deliveryAddressId: parsed.data.deliveryAddressId || undefined,
      paymentMethod: parsed.data.paymentMethod,
      paymentMode: 'cod',
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, data: result.data }, { status: result.status });
  } catch (error) {
    console.error('Orders POST error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

