import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import { calculateRentalPrice } from '@/lib/utils';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import Booking from '@/models/Booking';
import Category from '@/models/Category';
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

    const { productId, quantity = 1, rentalStart, rentalEnd } = await req.json();

    await connectToDatabase();

    const product = await Product.findById(productId);
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const start = new Date(rentalStart);
    const end = new Date(rentalEnd);
    const rentalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (rentalDays < product.minRentalDays) {
      return NextResponse.json({ error: `Minimum rental period is ${product.minRentalDays} days` }, { status: 400 });
    }

    const overlappingBookings = await Booking.countDocuments({
      product: productId,
      status: { $in: ['confirmed', 'active', 'preparing', 'out_for_delivery', 'delivered'] },
      rentalStart: { $lte: end },
      rentalEnd: { $gte: start },
    });

    const available = product.availableStock - overlappingBookings;
    if (quantity > available) {
      return NextResponse.json({ error: `Only ${available} available for selected dates` }, { status: 400 });
    }

    const pricePerDay = calculateRentalPrice(product.dailyPrice, product.weeklyPrice || null, product.monthlyPrice || null, rentalDays);
    const totalPrice = Math.round(pricePerDay * rentalDays * quantity);

    let cart = await Cart.findOne({ user: user.id });
    if (!cart) cart = await Cart.create({ user: user.id, items: [] });

    const existingItemIndex = cart.items.findIndex((item: any) => 
      item.product.toString() === productId && 
      new Date(item.rentalStart).getTime() === start.getTime() && 
      new Date(item.rentalEnd).getTime() === end.getTime()
    );

    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalPrice = pricePerDay * rentalDays * cart.items[existingItemIndex].quantity;
    } else {
      cart.items.push({
        product: productId as any,
        quantity,
        rentalStart: start,
        rentalEnd: end,
        rentalDays,
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
