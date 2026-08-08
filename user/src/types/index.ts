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
  rentalDays: number;
  pricePerDay: number;
  rentalAmount: number;
  securityDeposit: number;
  totalAmount: number;
  deliveryMethod: string;
  status: string;
  lateFees: number;
  depositRefunded: boolean;
  depositRefundAmount: number;
  createdAt: string;
}

export interface OrderType {
  id: string;
  orderNumber: string;
  items: {
    productName: string;
    quantity: number;
    pricePerDay: number;
    rentalDays: number;
    rentalAmount: number;
    securityDeposit: number;
  }[];
  subtotal: number;
  securityDepositTotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  deliveryMethod: string;
  paymentMethod: string;
  paymentStatus: string;
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
