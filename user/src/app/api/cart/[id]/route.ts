import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import Cart from '@/models/Cart';
import Product from '@/models/Product';
import { getProductAvailability } from '@/lib/rental-service';
import { cartUpdateSchema } from '@/lib/validation';
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = cartUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid quantity' }, { status: 400 });
    }

    const { quantity } = parsed.data;

    await connectToDatabase();

    const cart = await Cart.findOne({ user: user.id });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    const itemIndex = cart.items.findIndex((item: any) => item._id && item._id.toString() === id);
    if (itemIndex === -1) return NextResponse.json({ error: 'Cart item not found' }, { status: 404 });

    const item = cart.items[itemIndex];
    const product = await Product.findById(item.product);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const availability = await getProductAvailability({
      productId: product._id.toString(),
      rentalStart: item.rentalStart,
      rentalEnd: item.rentalEnd,
      quantity,
    });

    if (!availability.ok) {
      return NextResponse.json({ error: availability.error }, { status: availability.status });
    }

    if (!availability.data.isAvailable) {
      return NextResponse.json(
        { error: `Only ${availability.data.availableQuantity} units are available for these dates` },
        { status: 400 }
      );
    }

    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].totalPrice = cart.items[itemIndex].pricePerDay * cart.items[itemIndex].rentalDays * quantity;

    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name slug icon' }
    });

    return NextResponse.json({ success: true, data: formatCart(updatedCart) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart item' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const cart = await Cart.findOne({ user: user.id });
    if (!cart) return NextResponse.json({ error: 'Cart not found' }, { status: 404 });

    cart.items = cart.items.filter((item: any) => item._id && item._id.toString() !== id) as any;
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'category', select: 'name slug icon' }
    });

    return NextResponse.json({ success: true, data: formatCart(updatedCart) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove cart item' }, { status: 500 });
  }
}
