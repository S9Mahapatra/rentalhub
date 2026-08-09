/**
 * Seller details printed on invoices.
 *
 * Overridable per-deployment via env so the legal entity, GSTIN and pickup
 * address can change without a code edit.
 */
export const STORE = {
  legalName: process.env.NEXT_PUBLIC_STORE_NAME || 'AeroRent Marketplace Inc.',
  brand: 'AERO RENT',
  tagline: 'RENTAL MARKETPLACE',
  gstin: process.env.NEXT_PUBLIC_STORE_GSTIN || '19AABCA1234F1Z5',
  cin: process.env.NEXT_PUBLIC_STORE_CIN || 'U74999WB2024PTC000000',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'support@aerorent.com',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+91 33 4000 1200',
  address: {
    line1: process.env.NEXT_PUBLIC_STORE_ADDRESS_LINE1 || '4th Floor, Technopolis Building',
    line2: process.env.NEXT_PUBLIC_STORE_ADDRESS_LINE2 || 'Sector V, Salt Lake',
    city: process.env.NEXT_PUBLIC_STORE_CITY || 'Kolkata',
    state: process.env.NEXT_PUBLIC_STORE_STATE || 'West Bengal',
    zip: process.env.NEXT_PUBLIC_STORE_ZIP || '700091',
    country: 'India',
  },
} as const;

export function storeAddressLines() {
  const { address } = STORE;
  return [
    address.line1,
    address.line2,
    `${address.city}, ${address.state} ${address.zip}`,
    address.country,
  ].filter(Boolean);
}
