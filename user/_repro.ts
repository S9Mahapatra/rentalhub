import connectToDatabase from './src/lib/mongodb';
import Cart from './src/models/Cart';
import User from './src/models/User';
import Order from './src/models/Order';
import Booking from './src/models/Booking';
import Payment from './src/models/Payment';
import SecurityDeposit from './src/models/SecurityDeposit';
import { createRentalCheckoutOrder } from './src/lib/rental-service';
import mongoose from 'mongoose';

const run = async () => {
  await connectToDatabase();
  const cart = await Cart.findOne({ 'items.0': { $exists: true } }).lean<any>();
  if (!cart) { console.log('no non-empty cart found'); return; }

  const user = await User.findById(cart.user).select('email addresses').lean<any>();
  const addrs = user?.addresses || [];
  console.log(`user=${user?.email || cart.user}  addrs=${addrs.length}  items=${cart.items.length}`);
  if (!addrs.length) { console.log('user still has no address -> would 400, not 500. stopping.'); return; }

  const addrId = String(addrs[0]._id || addrs[0].id);
  console.log(`using addressId=${addrId} (typeof=${typeof addrId}, len=${addrId.length})\n`);

  const items = JSON.parse(JSON.stringify(cart.items.map((i: any) => ({
    productId: String(i.product), quantity: i.quantity,
    rentalStart: i.rentalStart, rentalEnd: i.rentalEnd,
  }))));

  let createdOrderId: any = null;
  try {
    const result: any = await createRentalCheckoutOrder({
      userId: String(cart.user), items, deliveryMethod: 'delivery',
      deliveryAddressId: addrId, paymentMethod: 'cod', paymentMode: 'cod',
    });
    console.log('createRentalCheckoutOrder ->', result.ok ? 'OK' : `FAILED(${result.status}): ${result.error}`);
    if (result.ok) {
      createdOrderId = result.data.order?.id;
      console.log('orderNumber:', result.data.order?.orderNumber);
      try { JSON.stringify(result.data); console.log('JSON.stringify(result.data) -> OK'); }
      catch (e: any) { console.log(`JSON.stringify(result.data) -> THROWS ${e.name}: ${e.message}`); console.log(e.stack); }
    }
  } catch (e: any) {
    console.log(`THREW ${e.name}: ${e.message}`);
    console.log(e.stack);
  }

  if (createdOrderId) {
    const oid = new mongoose.Types.ObjectId(createdOrderId);
    const r = await Promise.all([
      Booking.deleteMany({ order: oid }), Payment.deleteMany({ order: oid }),
      SecurityDeposit.deleteMany({ order: oid }), Order.deleteOne({ _id: oid }),
    ]);
    console.log(`\nCLEANUP: removed test order ${createdOrderId} (bookings=${r[0].deletedCount} payments=${r[1].deletedCount} deposits=${r[2].deletedCount} orders=${r[3].deletedCount})`);
  }
  await mongoose.disconnect();
};
run().catch((e) => { console.error('SCRIPT ERROR:', e.name, e.message, '\n', e.stack); process.exit(1); });
