import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { markOrderPaid, markOrderPaymentFailed } from '@/lib/rental-service';
import { verifyWebhookSignature } from '@/lib/cashfree';

/**
 * Cashfree's server-to-server payment notification.
 *
 * This is the authoritative settlement path: a shopper who pays and then closes
 * the tab never hits the return URL, so the order would otherwise stay stuck in
 * `pending_payment`.
 *
 * Unauthenticated by design — trust comes from the HMAC signature, so the body
 * is read raw and verified before anything is parsed or written.
 */
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-webhook-signature');
    const timestamp = req.headers.get('x-webhook-timestamp');

    if (!signature || !timestamp) {
      return NextResponse.json({ error: 'Missing signature headers' }, { status: 400 });
    }

    if (!verifyWebhookSignature({ signature, timestamp, rawBody })) {
      console.warn('Cashfree webhook: signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    const orderNumber: string | undefined = event?.data?.order?.order_id;
    const paymentStatus: string | undefined = event?.data?.payment?.payment_status;

    if (!orderNumber) {
      return NextResponse.json({ received: true });
    }

    await connectToDatabase();
    const order = await Order.findOne({ orderNumber });
    if (!order) {
      // Ack unknown orders so Cashfree stops retrying a delivery we can never fulfil.
      console.warn(`Cashfree webhook: unknown order ${orderNumber}`);
      return NextResponse.json({ received: true });
    }

    if (paymentStatus === 'SUCCESS') {
      await markOrderPaid({
        orderId: order._id.toString(),
        gatewayPaymentId: event?.data?.payment?.cf_payment_id?.toString(),
        paymentMethod: 'cashfree',
      });
    } else if (paymentStatus === 'FAILED' || paymentStatus === 'USER_DROPPED') {
      await markOrderPaymentFailed({
        orderId: order._id.toString(),
        reason: `Cashfree reported ${paymentStatus}`,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    // A 500 makes Cashfree retry, which is what we want for transient failures.
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
