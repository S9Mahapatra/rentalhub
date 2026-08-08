import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  category: mongoose.Types.ObjectId;
  images: string[];
  imageUrl?: string;
  dailyPrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  securityDeposit: number;
  originalPrice?: number;
  ratingAvg: number;
  ratingCount: number;
  totalStock: number;
  availableStock: number;
  specifications: any;
  features: string[];
  tags: string[];
  isActive: boolean;
  isBestseller: boolean;
  minRentalDays: number;
  maxRentalDays: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ type: String }],
    imageUrl: { type: String },
    dailyPrice: { type: Number, required: true },
    weeklyPrice: { type: Number },
    monthlyPrice: { type: Number },
    securityDeposit: { type: Number, required: true },
    originalPrice: { type: Number },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    totalStock: { type: Number, default: 1 },
    availableStock: { type: Number, default: 1 },
    specifications: { type: Schema.Types.Mixed, default: {} },
    features: [{ type: String }],
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
    isBestseller: { type: Boolean, default: false },
    minRentalDays: { type: Number, default: 1 },
    maxRentalDays: { type: Number, default: 365 },
  },
  { timestamps: true }
);

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
