import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import { calculateRentalBreakdown } from '@/lib/utils';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getProductAvailability } from '@/lib/rental-service';
import { cartItemSchema } from '@/lib/validation';
import '@/models/Category';

const formatCart = (cartDoc: any) => {
  if (!cartDoc) return null;
  const cart = cartDoc.toJSON();
  cart.id = cart._id.toString();
  cart.userId = cart.user.toString();
  
  cart.items = (cart.items || []).map((item: any) => {
    item.id = item._id ? item._id.toString() : '';
    item.cartId = cart.id;
    if (item.product && item.product._id) {
      item.productId = item.product._id.toString();
      item.product.id = item.productId;
      if (item.product.category && item.product.category._id) {
        item.product.category.id = item.product.category._id.toString();
      }
    }
    return item;
  });
  return cart;
};

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const cart = await Cart.findOne({ user: user.id })
      .populate({
        path: 'items.product',
        populate: { path: 'category', select: 'name slug icon' }
      });

    if (!cart) {
      const newCart = await Cart.create({ user: user.id, items: [] });
      return NextResponse.json({ success: true, data: formatCart(newCart) });
    }

    if (cart.items && cart.items.length > 0) {
      cart.items.reverse();
    }

    return NextResponse.json({ success: true, data: formatCart(cart) });
  } catch (error: any) {
    console.error('Cart GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = cartItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid cart item' }, { status: 400 });
    }

    const { productId, quantity, rentalStart, rentalEnd } = parsed.data;

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const availability = await getProductAvailability({
      productId,
      rentalStart,
      rentalEnd,
      quantity,
    });

    if (!availability.ok) {
      return NextResponse.json({ error: availability.error }, { status: availability.status });
    }

    if (!availability.data.isAvailable) {
      return NextResponse.json(
        { error: `Only ${availability.data.availableQuantity} units are available for the selected rental period` },
        { status: 400 }
      );
    }

    const breakdown = calculateRentalBreakdown({
      dailyPrice: product.dailyPrice,
      weeklyPrice: product.weeklyPrice || null,
      monthlyPrice: product.monthlyPrice || null,
      rentalStartAt: rentalStart,
      expectedReturnAt: rentalEnd,
      quantity,
    });

    if (breakdown.billingDays < product.minRentalDays) {
      return NextResponse.json({ error: `Minimum rental period is ${product.minRentalDays} days` }, { status: 400 });
    }
    const pricePerDay = breakdown.pricePerDay;
    const totalPrice = breakdown.rentalAmount;

    let cart = await Cart.findOne({ user: user.id });
    if (!cart) cart = await Cart.create({ user: user.id, items: [] });

    const existingItemIndex = cart.items.findIndex((item: any) => 
      item.product.toString() === productId && 
      new Date(item.rentalStart).getTime() === new Date(rentalStart).getTime() && 
      new Date(item.rentalEnd).getTime() === new Date(rentalEnd).getTime()
    );

    const finalQuantity = existingItemIndex >= 0
      ? cart.items[existingItemIndex].quantity + quantity
      : quantity;

    if (finalQuantity > availability.data.availableQuantity) {
      return NextResponse.json(
        { error: `Only ${availability.data.availableQuantity} units are available for the selected rental period` },
        { status: 400 }
      );
    }

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity = finalQuantity;
      cart.items[existingItemIndex].totalPrice = pricePerDay * breakdown.billingDays * finalQuantity;
    } else {
      cart.items.push({
        product: productId as any,
        quantity,
        rentalStart: new Date(rentalStart),
        rentalEnd: new Date(rentalEnd),
        rentalDays: breakdown.billingDays,
        pricePerDay,
        totalPrice
      });
    }

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name slug icon' }
    });

    return NextResponse.json({ success: true, data: formatCart(updatedCart) });
  } catch (error: any) {
    console.error('Cart POST Error:', error);
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    await Cart.findOneAndUpdate({ user: user.id }, { $set: { items: [] } });

    return NextResponse.json({ success: true, message: 'Cart cleared' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to clear cart' }, { status: 500 });
  }
}
