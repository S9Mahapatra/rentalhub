import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/server-utils';
import { createRentalCheckoutOrder, markOrderPaymentFailed } from '@/lib/rental-service';
import { checkoutSchema, getValidationErrorMessage } from '@/lib/validation';
import { createCashfreeOrder, isCashfreeConfigured } from '@/lib/cashfree';

/**
 * Creates the order in `pending_payment` and opens a Cashfree payment session
 * for it.
 *
 * The order total is whatever `createRentalCheckoutOrder` computes from the
 * product catalogue — the client never supplies an amount, so a tampered
 * request cannot underpay.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isCashfreeConfigured()) {
      return NextResponse.json(
        { error: 'Online payment is not configured. Please choose Cash on Delivery.' },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse({ ...body, paymentMode: 'online' });
    if (!parsed.success) {
      return NextResponse.json({ error: getValidationErrorMessage(parsed.error) }, { status: 400 });
    }

    const result = await createRentalCheckoutOrder({
      userId: user.id,
      items: parsed.data.items,
      deliveryMethod: parsed.data.deliveryMethod,
      deliveryAddressId: parsed.data.deliveryAddressId || undefined,
      paymentMethod: parsed.data.paymentMethod,
      paymentMode: 'online',
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    const order = (result.data as any).order;
    const origin = new URL(req.url).origin;

    try {
      const cashfreeOrder = await createCashfreeOrder({
        // Cashfree order ids must be unique forever, so the order number (not
        // the mongo id) is used and echoed back on the return URL.
        orderId: order.orderNumber,
        amount: order.totalAmount,
        customer: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: (user as any).phone,
        },
        returnUrl: `${origin}/checkout/status?order_id=${encodeURIComponent(order.orderNumber)}`,
        notifyUrl: `${origin}/api/payments/cashfree/webhook`,
      });

      return NextResponse.json({
        success: true,
        data: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          paymentSessionId: cashfreeOrder.payment_session_id,
        },
      });
    } catch (gatewayError: any) {
      // The order exists but has no payable session — fail it so it does not
      // sit in `pending_payment` holding stock forever.
      await markOrderPaymentFailed({
        orderId: order.id,
        reason: gatewayError?.message || 'Could not start payment',
      });

      return NextResponse.json(
        { error: gatewayError?.message || 'Could not start payment' },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error('Cashfree create error:', error);
    return NextResponse.json({ error: 'Failed to start payment' }, { status: 500 });
  }
}
