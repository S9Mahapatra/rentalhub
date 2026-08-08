export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductType {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: { id: string; name: string; slug: string; icon: string };
  images: string[];
  imageUrl?: string;
  dailyPrice: number;
  weeklyPrice: number | null;
  monthlyPrice: number | null;
  securityDeposit: number;
  originalPrice: number | null;
  ratingAvg: number;
  ratingCount: number;
  totalStock: number;
  availableStock: number;
  specifications: { key: string; value: string }[];
  features: string[];
  tags: string[];
  isBestseller: boolean;
  minRentalDays: number;
  maxRentalDays: number;
  attributes?: Record<string, unknown>;
  variants?: {
    name: string;
    value: string;
    sku?: string;
    stock?: number;
    additionalPrice?: number;
  }[];
  availability?: {
    availableQuantity: number;
    requestedQuantity: number;
    isAvailable: boolean;
    reservedQuantity: number;
    conflictingBookings: {
      id: string;
      status: string;
      quantity: number;
      rentalStartAt: string;
      expectedReturnAt: string;
    }[];
  };
}

export interface CartItemType {
  id: string;
  product: ProductType;
  quantity: number;
  rentalStart: string;
  rentalEnd: string;
  rentalDays: number;
  pricePerDay: number;
  totalPrice: number;
}

export interface BookingType {
  id: string;
  product: ProductType;
  quantity: number;
  rentalStart: string;
  rentalEnd: string;
  rentalStartAt?: string;
  expectedReturnAt?: string;
  actualPickupAt?: string;
  actualReturnAt?: string;
  rentalDays: number;
  rentalMinutes?: number;
  pricePerDay: number;
  rentalAmount: number;
  securityDeposit: number;
  totalAmount: number;
  deliveryMethod: string;
  deliveryAddressSnapshot?: AddressType;
  pickupScheduledAt?: string;
  pickupConfirmedAt?: string;
  pickupConfirmationStatus?: string;
  returnConfirmationStatus?: string;
  returnStatus?: string;
  status: string;
  paymentStatus?: string;
  paymentMethod?: string;
  paymentId?: string;
  invoiceNumber?: string;
  depositPaymentStatus?: string;
  depositHeldStatus?: string;
  depositRefundStatus?: string;
  lateFees: number;
  depositRefunded: boolean;
  depositRefundAmount: number;
  depositDeductedAmount?: number;
  deductionReason?: string;
  balanceDue?: number;
  overdue?: boolean;
  lateFeeRateType?: string;
  lateFeeRate?: number;
  lateDurationMinutes?: number;
  lateDurationHours?: number;
  lateDurationDays?: number;
  actualReturnDate?: string;
  createdAt: string;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  invoiceNumber?: string;
  bookings?: string[];
  items: {
    bookingId?: string;
    productName: string;
    quantity: number;
    pricePerDay: number;
    rentalDays: number;
    rentalAmount: number;
    securityDeposit: number;
    rentalStartAt?: string;
    expectedReturnAt?: string;
  }[];
  subtotal: number;
  securityDepositTotal: number;
  securityDepositRefundTotal?: number;
  securityDepositDeductedTotal?: number;
  lateFeeTotal?: number;
  refundTotal?: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  deliveryMethod: string;
  deliveryAddressSnapshot?: AddressType;
  paymentMethod: string;
  paymentStatus: string;
  paymentProvider?: string;
  paymentReference?: string;
  status: string;
  createdAt: string;
}

export interface AddressType {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export interface ProfileType {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  defaultAddressId?: string | null;
  addresses: AddressType[];
}
