import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IOrderItem {
  product: mongoose.Types.ObjectId;
  productName: string;
  quantity: number;
  pricePerDay: number;
  rentalDays: number;
  rentalAmount: number;
  securityDeposit: number;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  orderNumber: string;
  subtotal: number;
  securityDepositTotal: number;
  deliveryFee: number;
  tax: number;
  totalAmount: number;
  deliveryMethod: string;
  deliveryAddressId?: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentId?: string;
  status: string;
  invoiceUrl?: string;
  notes?: string;
  items: IOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  rentalDays: { type: Number, required: true },
  rentalAmount: { type: Number, required: true },
  securityDeposit: { type: Number, required: true },
});

const OrderSchema = new Schema<IOrder>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, required: true, unique: true },
    subtotal: { type: Number, required: true },
    securityDepositTotal: { type: Number, required: true },
    deliveryFee: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    deliveryMethod: { type: String, required: true },
    deliveryAddressId: { type: String },
    paymentMethod: { type: String, default: 'card' },
    paymentStatus: { type: String, default: 'pending' },
    paymentId: { type: String },
    status: { type: String, default: 'placed' },
    invoiceUrl: { type: String },
    notes: { type: String },
    items: [OrderItemSchema],
  },
  { timestamps: true }
);

const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
