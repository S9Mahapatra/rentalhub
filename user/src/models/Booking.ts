import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IBooking extends Document {
  user: mongoose.Types.ObjectId;
  product: mongoose.Types.ObjectId;
  quantity: number;
  rentalStart: Date;
  rentalEnd: Date;
  rentalDays: number;
  pricePerDay: number;
  rentalAmount: number;
  securityDeposit: number;
  totalAmount: number;
  deliveryMethod: string;
  deliveryAddressId?: string;
  status: string;
  actualReturnDate?: Date;
  lateFees: number;
  depositRefunded: boolean;
  depositRefundAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1 },
    rentalStart: { type: Date, required: true },
    rentalEnd: { type: Date, required: true },
    rentalDays: { type: Number, required: true },
    pricePerDay: { type: Number, required: true },
    rentalAmount: { type: Number, required: true },
    securityDeposit: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    deliveryMethod: { type: String, required: true },
    deliveryAddressId: { type: String },
    status: { type: String, default: 'pending' },
    actualReturnDate: { type: Date },
    lateFees: { type: Number, default: 0 },
    depositRefunded: { type: Boolean, default: false },
    depositRefundAmount: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

const Booking: Model<IBooking> = mongoose.models.Booking || mongoose.model<IBooking>('Booking', BookingSchema);

export default Booking;
