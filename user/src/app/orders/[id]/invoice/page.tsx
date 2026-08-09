import { notFound, redirect } from 'next/navigation';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Booking from '@/models/Booking';
import Product from '@/models/Product';
import { getCurrentUser } from '@/lib/server-utils';
import { formatCurrency } from '@/lib/utils';
import { STORE, storeAddressLines } from '@/lib/store-config';
import InvoiceActions from './InvoiceActions';

export const dynamic = 'force-dynamic';

interface PickupLocation {
  /** Identity of the physical shop, used to collapse duplicates across items. */
  key: string;
  shopName: string;
  lines: string[];
  phone?: string;
}

interface InvoiceRow {
  name: string;
  brand?: string;
  quantity: number;
  pricePerDay: number;
  days: number;
  rentalAmount: number;
  deposit: number;
  start?: string | Date;
  end?: string | Date;
  pickup: PickupLocation;
}

/**
 * Resolves the shop a product is rented out of. Products listed through the
 * admin app carry their own `storeLocation`; anything without one falls back to
 * the marketplace's own address so the invoice never prints a blank pickup
 * point.
 */
function toPickupLocation(storeLocation?: any): PickupLocation {
  const shopName = storeLocation?.shopName?.trim();
  const street = storeLocation?.address?.trim();
  const cityLine = [storeLocation?.city?.trim(), storeLocation?.zipCode?.trim()]
    .filter(Boolean)
    .join(' ');
  const phone = storeLocation?.contactPhone?.trim();

  const hasOwnAddress = Boolean(street || cityLine);
  const lines = hasOwnAddress ? [street, cityLine].filter(Boolean) : storeAddressLines();

  const resolved = {
    shopName: shopName || STORE.legalName,
    lines,
    phone: phone || STORE.phone,
  };

  return { ...resolved, key: `${resolved.shopName}|${resolved.lines.join('|')}` };
}

function formatDate(value?: string | Date) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value?: string | Date) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getCurrentUser();
  if (!user) redirect(`/auth/login?callbackUrl=${encodeURIComponent(`/orders/${id}/invoice`)}`);

  await connectToDatabase();

  // Scoped to the signed-in user so an order id cannot be used to read
  // somebody else's invoice.
  const orderDoc = await Order.findOne({ _id: id, user: user.id }).lean<any>();
  if (!orderDoc) notFound();

  const bookings = await Booking.find({ order: orderDoc._id })
    .populate('product', 'name brand storeLocation')
    .lean<any[]>();

  // The order's own item snapshot keeps only a product id, so when it is used
  // as the fallback below the shop details have to be looked up separately.
  const fallbackProducts = bookings.length
    ? []
    : await Product.find({
        _id: { $in: (orderDoc.items || []).map((item: any) => item.product).filter(Boolean) },
      })
        .select('name brand storeLocation')
        .lean<any[]>();
  const fallbackProductById = new Map(fallbackProducts.map((product) => [String(product._id), product]));

  const isPaid = orderDoc.paymentStatus === 'paid';
  const isCOD = orderDoc.paymentProvider === 'cod' || orderDoc.paymentMethod === 'cod';
  const address = orderDoc.deliveryAddressSnapshot;

  // A COD order is a legitimate confirmed booking that simply has not been
  // collected yet, so it prints as a payable invoice rather than a receipt.
  const statusLabel = isPaid ? 'PAID IN FULL' : isCOD ? 'PAYABLE ON DELIVERY' : 'PAYMENT PENDING';
  const statusClass = isPaid
    ? 'bg-emerald-500 text-white'
    : isCOD
      ? 'bg-amber-400 text-neutral-950'
      : 'bg-neutral-300 text-neutral-900';

  // Bookings carry the richest data, but fall back to the order's item
  // snapshot so an invoice still renders if a booking was purged.
  const rows: InvoiceRow[] = bookings.length
    ? bookings.map((b) => ({
        name: b.product?.name || 'Rental item',
        brand: b.product?.brand,
        quantity: b.quantity,
        pricePerDay: b.pricePerDay,
        days: b.rentalDays,
        rentalAmount: b.rentalAmount,
        deposit: b.securityDeposit,
        start: b.rentalStartAt || b.rentalStart,
        end: b.expectedReturnAt || b.rentalEnd,
        pickup: toPickupLocation(b.product?.storeLocation),
      }))
    : (orderDoc.items || []).map((item: any) => {
        const product = fallbackProductById.get(String(item.product));
        return {
          name: item.productName,
          brand: product?.brand,
          quantity: item.quantity,
          pricePerDay: item.pricePerDay,
          days: item.rentalDays,
          rentalAmount: item.rentalAmount,
          deposit: item.securityDeposit,
          start: item.rentalStartAt,
          end: item.expectedReturnAt,
          pickup: toPickupLocation(product?.storeLocation),
        };
      });

  // Items can come from different shops, so only fold the address into the
  // fulfilment block when the whole order ships from one place.
  const pickupLocations = [...new Map(rows.map((row) => [row.pickup.key, row.pickup])).values()];
  const singlePickup = pickupLocations.length === 1 ? pickupLocations[0] : null;
  const isDelivery = orderDoc.deliveryMethod === 'delivery';

  return (
    <div className="bg-neutral-100 print:bg-white min-h-screen py-10 print:py-0">
      <div className="max-w-4xl mx-auto px-4 print:px-0 print:max-w-none">
        <InvoiceActions orderId={orderDoc._id.toString()} />

        <div className="bg-white border border-neutral-200 print:border-0 shadow-sm print:shadow-none">
          {/* Masthead */}
          <div className="flex flex-wrap gap-6 justify-between items-start p-8 sm:p-10 border-b-4 border-neutral-950">
            <div>
              <p className="text-2xl font-black tracking-tight text-neutral-950 leading-none">{STORE.brand}</p>
              <p className="text-[10px] font-bold tracking-[0.25em] text-emerald-600 mt-1">{STORE.tagline}</p>
              <div className="mt-4 text-[11px] leading-relaxed text-neutral-500 font-medium">
                <p className="text-neutral-900 font-bold">{STORE.legalName}</p>
                {storeAddressLines().map((line) => (
                  <p key={line}>{line}</p>
                ))}
                <p className="mt-1">GSTIN: {STORE.gstin}</p>
                <p>{STORE.email} · {STORE.phone}</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-3xl font-black tracking-tight text-neutral-950 leading-none">INVOICE</p>
              <p className="font-mono text-xs text-neutral-500 mt-2">{orderDoc.invoiceNumber || orderDoc.orderNumber}</p>
              <span className={`inline-block mt-4 px-3 py-1.5 text-[10px] font-black tracking-[0.15em] ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Parties + meta */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 p-8 sm:p-10 border-b border-neutral-200">
            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-neutral-400 mb-3">BILLED TO</p>
              <p className="text-sm font-bold text-neutral-950">{user.name || 'Customer'}</p>
              <p className="text-xs text-neutral-500 font-medium">{user.email}</p>
              {address && (
                <div className="text-xs text-neutral-500 font-medium mt-2 leading-relaxed">
                  <p>{address.street}</p>
                  <p>{address.city}, {address.state} {address.zipCode}</p>
                  {address.phone && <p className="mt-1">Ph: {address.phone}</p>}
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-black tracking-[0.2em] text-neutral-400 mb-3">FULFILMENT</p>
              <p className="text-sm font-bold text-neutral-950 capitalize">
                {isDelivery ? 'Direct Delivery' : 'Store Pickup'}
              </p>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                {isDelivery
                  ? 'Delivered to the billing address'
                  : 'Collect from the rental point below'}
              </p>

              {singlePickup ? (
                <div className="mt-4">
                  <p className="text-[10px] font-black tracking-[0.2em] text-neutral-400 mb-1.5">
                    {isDelivery ? 'DISPATCHED FROM' : 'PICKUP POINT'}
                  </p>
                  <p className="text-xs font-bold text-neutral-950">{singlePickup.shopName}</p>
                  <div className="text-xs text-neutral-500 font-medium leading-relaxed">
                    {singlePickup.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                    {singlePickup.phone && <p className="mt-1">Ph: {singlePickup.phone}</p>}
                  </div>
                </div>
              ) : (
                <p className="text-[11px] text-neutral-500 font-medium mt-4 leading-relaxed">
                  Items come from {pickupLocations.length} rental points — the shop for each item is
                  listed against its line below.
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <p className="text-[10px] font-black tracking-[0.2em] text-neutral-400 mb-3">DETAILS</p>
              <dl className="text-xs space-y-1">
                <div className="flex sm:justify-end gap-2">
                  <dt className="text-neutral-400 font-medium">Issued</dt>
                  <dd className="text-neutral-900 font-bold">{formatDate(orderDoc.createdAt)}</dd>
                </div>
                <div className="flex sm:justify-end gap-2">
                  <dt className="text-neutral-400 font-medium">Order</dt>
                  <dd className="text-neutral-900 font-bold font-mono">{orderDoc.orderNumber}</dd>
                </div>
                <div className="flex sm:justify-end gap-2">
                  <dt className="text-neutral-400 font-medium">Method</dt>
                  <dd className="text-neutral-900 font-bold uppercase">
                    {isCOD ? 'Cash on delivery' : orderDoc.paymentProvider || 'Online'}
                  </dd>
                </div>
                {isPaid && orderDoc.paymentId && (
                  <div className="flex sm:justify-end gap-2">
                    <dt className="text-neutral-400 font-medium">Txn</dt>
                    <dd className="text-neutral-900 font-bold font-mono break-all">{orderDoc.paymentId}</dd>
                  </div>
                )}
                {isPaid && orderDoc.confirmationAt && (
                  <div className="flex sm:justify-end gap-2">
                    <dt className="text-neutral-400 font-medium">Paid</dt>
                    <dd className="text-neutral-900 font-bold">{formatDateTime(orderDoc.confirmationAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* Line items */}
          <div className="p-8 sm:p-10 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b-2 border-neutral-950">
                  <th className="pb-3 text-[10px] font-black tracking-[0.15em] text-neutral-500">ITEM &amp; RENTAL WINDOW</th>
                  <th className="pb-3 text-[10px] font-black tracking-[0.15em] text-neutral-500 text-center">QTY</th>
                  <th className="pb-3 text-[10px] font-black tracking-[0.15em] text-neutral-500 text-center">DAYS</th>
                  <th className="pb-3 text-[10px] font-black tracking-[0.15em] text-neutral-500 text-right">RATE/DAY</th>
                  <th className="pb-3 text-[10px] font-black tracking-[0.15em] text-neutral-500 text-right">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-neutral-100">
                    <td className="py-4 pr-4">
                      <p className="text-sm font-bold text-neutral-950">{row.name}</p>
                      {row.brand && <p className="text-[11px] text-neutral-400 font-medium">{row.brand}</p>}
                      <p className="text-[11px] text-neutral-500 font-medium mt-1 font-mono">
                        {formatDate(row.start)} → {formatDate(row.end)}
                      </p>
                      {row.deposit > 0 && (
                        <p className="text-[11px] text-emerald-600 font-bold mt-1">
                          + {formatCurrency(row.deposit)} refundable deposit
                        </p>
                      )}
                      {!singlePickup && (
                        <p className="text-[11px] text-neutral-500 font-medium mt-1 leading-relaxed">
                          <span className="font-bold text-neutral-700">
                            {isDelivery ? 'From' : 'Pickup'}: {row.pickup.shopName}
                          </span>
                          {row.pickup.lines.length > 0 && ` · ${row.pickup.lines.join(', ')}`}
                        </p>
                      )}
                    </td>
                    <td className="py-4 text-center text-sm font-bold text-neutral-700">{row.quantity}</td>
                    <td className="py-4 text-center text-sm font-bold text-neutral-700">{row.days}</td>
                    <td className="py-4 text-right text-sm font-medium text-neutral-600">{formatCurrency(row.pricePerDay)}</td>
                    <td className="py-4 text-right text-sm font-black text-neutral-950">{formatCurrency(row.rentalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mt-8">
              <div className="w-full sm:w-80 space-y-2.5">
                <Row label="Rental subtotal" value={formatCurrency(orderDoc.subtotal)} />
                <Row label="Refundable deposit" value={formatCurrency(orderDoc.securityDepositTotal)} accent />
                <Row
                  label="Logistics & fulfilment"
                  value={orderDoc.deliveryFee > 0 ? formatCurrency(orderDoc.deliveryFee) : 'Free'}
                />
                <Row label="GST (18%)" value={formatCurrency(orderDoc.tax)} />
                {orderDoc.lateFeeTotal > 0 && (
                  <Row label="Late fees" value={formatCurrency(orderDoc.lateFeeTotal)} />
                )}

                <div className="flex justify-between items-center pt-4 mt-2 border-t-2 border-neutral-950">
                  <span className="text-sm font-black text-neutral-950">
                    {isPaid ? 'TOTAL PAID' : 'TOTAL PAYABLE'}
                  </span>
                  <span className="text-2xl font-black text-neutral-950">{formatCurrency(orderDoc.totalAmount)}</span>
                </div>

                {!isPaid && isCOD && (
                  <div className="mt-4 bg-amber-50 border-l-4 border-amber-400 p-4">
                    <p className="text-[11px] font-black tracking-wider text-amber-900 mb-1">COLLECT ON DELIVERY</p>
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                      Hand {formatCurrency(orderDoc.totalAmount)} to the delivery partner. This includes the{' '}
                      {formatCurrency(orderDoc.securityDepositTotal)} refundable deposit, returned after check-in.
                    </p>
                  </div>
                )}

                {isPaid && (
                  <div className="mt-4 bg-emerald-50 border-l-4 border-emerald-500 p-4">
                    <p className="text-[11px] font-black tracking-wider text-emerald-900 mb-1">PAYMENT RECEIVED</p>
                    <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                      Settled via {isCOD ? 'cash on delivery' : 'Cashfree'}. The{' '}
                      {formatCurrency(orderDoc.securityDepositTotal)} deposit is held and released after return.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Terms */}
          <div className="px-8 sm:px-10 py-6 border-t border-neutral-200 bg-neutral-50 print:bg-white">
            <p className="text-[10px] font-black tracking-[0.2em] text-neutral-400 mb-2">TERMS</p>
            <ul className="text-[11px] text-neutral-500 font-medium space-y-1 leading-relaxed">
              <li>· Security deposits are refunded within 5–7 business days of return check-in, less any damage or late-return deductions.</li>
              <li>· Late returns accrue fees per the rental agreement and are billed against the deposit.</li>
              <li>· Items must be returned in the condition received, with all supplied accessories.</li>
              <li>· This is a computer-generated invoice and is valid without a signature.</li>
            </ul>
            <p className="text-[11px] text-neutral-400 font-medium mt-4">
              Questions? {STORE.email} · {STORE.phone}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-neutral-500 font-medium">{label}</span>
      <span className={`font-bold ${accent ? 'text-emerald-600' : 'text-neutral-900'}`}>{value}</span>
    </div>
  );
}
