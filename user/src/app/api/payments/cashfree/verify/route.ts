import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { getCurrentUser } from '@/lib/server-utils';
import { markOrderPaid, markOrderPaymentFailed } from '@/lib/rental-service';
import { getCashfreeOrder, isCashfreeConfigured } from '@/lib/cashfree';

/**
 * Confirms an online payment after the shopper returns from Cashfree.
 *
 * The browser is not trusted: the order status is re-read from Cashfree's API
 * rather than taken from the redirect query string.
 */
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!isCashfreeConfigured()) {
      return NextResponse.json({ error: 'Online payment is not configured' }, { status: 503 });
    }

    const { orderNumber } = await req.json();
    if (!orderNumber || typeof orderNumber !== 'string') {
      return NextResponse.json({ error: 'orderNumber is required' }, { status: 400 });
    }

    await connectToDatabase();

    // Scoped to the signed-in user so one shopper cannot probe another's orders.
    const order = await Order.findOne({ orderNumber, user: user.id });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (order.paymentStatus === 'paid') {
      return NextResponse.json({
        success: true,
        data: { status: 'paid', orderId: order._id.toString() },
      });
    }

    const gatewayOrder = await getCashfreeOrder(orderNumber);

    if (gatewayOrder.order_status === 'PAID') {
      const result = await markOrderPaid({
        orderId: order._id.toString(),
        gatewayPaymentId: gatewayOrder.cf_order_id,
        paymentMethod: 'cashfree',
      });

      if (!result.ok) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }

      return NextResponse.json({
        success: true,
        data: { status: 'paid', orderId: order._id.toString() },
      });
    }

    // ACTIVE means the shopper abandoned the hosted page without paying; the
    // order stays payable so it is left alone for the webhook to settle later.
    if (gatewayOrder.order_status === 'ACTIVE') {
      return NextResponse.json({
        success: true,
        data: { status: 'pending', orderId: order._id.toString() },
      });
    }

    await markOrderPaymentFailed({
      orderId: order._id.toString(),
      reason: `Payment ${gatewayOrder.order_status.toLowerCase()}`,
    });

    return NextResponse.json({
      success: true,
      data: { status: 'failed', orderId: order._id.toString() },
    });
  } catch (error: any) {
    console.error('Cashfree verify error:', error);
    return NextResponse.json({ error: error?.message || 'Failed to verify payment' }, { status: 500 });
  }
}
