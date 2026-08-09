import crypto from 'crypto';

/**
 * Thin server-side wrapper over the Cashfree PG REST API (2023-08-01).
 *
 * The secret key never leaves the server: the browser only ever receives a
 * `payment_session_id`, which is scoped to a single order and is useless on
 * its own.
 */

const API_VERSION = '2023-08-01';

function baseUrl() {
  return process.env.CASHFREE_ENV === 'production'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';
}

function credentials() {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    throw new Error(
      'Cashfree is not configured. Set CASHFREE_APP_ID and CASHFREE_SECRET_KEY.'
    );
  }

  return { appId, secretKey };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const { appId, secretKey } = credentials();

  const res = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'x-api-version': API_VERSION,
      'x-client-id': appId,
      'x-client-secret': secretKey,
      ...init?.headers,
    },
    cache: 'no-store',
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      (payload as any)?.message || `Cashfree request failed (${res.status})`;
    throw new Error(message);
  }

  return payload as T;
}

export interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_status: string;
  payment_session_id: string;
}

export interface CashfreeOrderStatus {
  cf_order_id: string;
  order_id: string;
  /** ACTIVE | PAID | EXPIRED | TERMINATED */
  order_status: string;
  order_amount: number;
}

export async function createCashfreeOrder(params: {
  orderId: string;
  amount: number;
  customer: {
    id: string;
    name?: unknown;
    email?: unknown;
    phone?: unknown;
  };
  returnUrl: string;
  notifyUrl?: string;
}): Promise<CashfreeOrderResponse> {
  return request<CashfreeOrderResponse>('/orders', {
    method: 'POST',
    body: JSON.stringify({
      order_id: params.orderId,
      // Cashfree rejects amounts with more than two decimal places.
      order_amount: Number(params.amount.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: params.customer.id,
        customer_name: text(params.customer.name) || 'AeroRent Customer',
        customer_email: text(params.customer.email) || 'customer@aerorent.com',
        // Cashfree requires a syntactically valid Indian phone number.
        customer_phone: normalisePhone(params.customer.phone),
      },
      order_meta: {
        return_url: params.returnUrl,
        ...(params.notifyUrl ? { notify_url: params.notifyUrl } : {}),
      },
    }),
  });
}

export async function getCashfreeOrder(orderId: string) {
  return request<CashfreeOrderStatus>(`/orders/${encodeURIComponent(orderId)}`);
}

/**
 * Cashfree signs webhooks as base64(HMAC-SHA256(timestamp + rawBody, secret)).
 * The raw request body must be passed through byte-for-byte — re-serialising
 * parsed JSON changes the bytes and breaks the comparison.
 */
export function verifyWebhookSignature(params: {
  signature: string;
  timestamp: string;
  rawBody: string;
}) {
  const { secretKey } = credentials();

  const expected = crypto
    .createHmac('sha256', secretKey)
    .update(params.timestamp + params.rawBody)
    .digest('base64');

  const received = Buffer.from(params.signature);
  const computed = Buffer.from(expected);

  if (received.length !== computed.length) return false;
  return crypto.timingSafeEqual(received, computed);
}

/** Coerces a possibly non-string Mongo field into a trimmed string. */
function text(value: unknown) {
  return typeof value === 'string' ? value.trim() : value == null ? '' : String(value).trim();
}

function normalisePhone(phone?: unknown) {
  // Phone may arrive as a number from Mongo, so coerce before string ops.
  const digits = String(phone ?? '').replace(/\D/g, '');
  // Trim a leading country code so the gateway receives a bare 10-digit number.
  const local = digits.length > 10 ? digits.slice(-10) : digits;
  return local.length === 10 ? local : '9999999999';
}

export function isCashfreeConfigured() {
  return Boolean(process.env.CASHFREE_APP_ID && process.env.CASHFREE_SECRET_KEY);
}
