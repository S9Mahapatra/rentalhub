import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import { getCurrentUser } from '@/lib/server-utils';
import User from '@/models/User';
import { addressSchema, getValidationErrorMessage, profileUpdateSchema } from '@/lib/validation';

function serializeAddress(address: any) {
  const doc = address?.toJSON ? address.toJSON() : address;
  if (!doc) return doc;
  if (doc._id) doc.id = doc._id.toString();
  return doc;
}

function buildProfileResponse(userDoc: any) {
  const addresses = (userDoc.addresses || []).map(serializeAddress).sort((a: any, b: any) => {
    if (a.isDefault === b.isDefault) return 0;
    return a.isDefault ? -1 : 1;
  });

  const defaultAddress = addresses.find((address: any) => address.isDefault);

  return {
    id: userDoc._id.toString(),
    name: userDoc.name,
    email: userDoc.email,
    phone: userDoc.phone,
    image: userDoc.profileImage,
    defaultAddressId: defaultAddress?.id || null,
    addresses,
  };
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const userDoc = await User.findById(user.id).select('name email phone profileImage addresses');
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const profile = buildProfileResponse(userDoc);

    return NextResponse.json({
      success: true,
      data: profile.addresses,
      profile,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getValidationErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userDoc = await User.findById(user.id);
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const shouldMakeDefault = parsed.data.isDefault || userDoc.addresses.length === 0;

    if (shouldMakeDefault) {
      userDoc.addresses.forEach((address: any) => {
        address.isDefault = false;
      });
    }

    userDoc.addresses.push({
      label: parsed.data.label,
      street: parsed.data.street,
      city: parsed.data.city,
      state: parsed.data.state,
      zipCode: parsed.data.zipCode,
      country: parsed.data.country,
      isDefault: shouldMakeDefault,
    } as any);

    await userDoc.save();

    const newAddress = serializeAddress(userDoc.addresses[userDoc.addresses.length - 1]);

    return NextResponse.json(
      {
        success: true,
        data: newAddress,
        profile: buildProfileResponse(userDoc),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Profile POST error:', error);
    return NextResponse.json({ error: 'Failed to add address' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: getValidationErrorMessage(parsed.error) },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const userDoc = await User.findById(user.id);
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    if (parsed.data.email && parsed.data.email.toLowerCase() !== userDoc.email) {
      const existing = await User.findOne({
        email: parsed.data.email.toLowerCase(),
        _id: { $ne: user.id },
      });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      userDoc.email = parsed.data.email.toLowerCase();
    }

    if (parsed.data.name !== undefined) userDoc.name = parsed.data.name;
    if (parsed.data.phone !== undefined) userDoc.phone = parsed.data.phone;
    if (parsed.data.profileImage !== undefined) userDoc.profileImage = parsed.data.profileImage;

    if (parsed.data.defaultAddressId) {
      const addresses = userDoc.addresses as any;
      const defaultAddress = addresses.id(parsed.data.defaultAddressId);
      if (!defaultAddress) {
        return NextResponse.json({ error: 'Address not found' }, { status: 404 });
      }
      addresses.forEach((address: any) => {
        address.isDefault = address._id.toString() === parsed.data.defaultAddressId;
      });
    }

    await userDoc.save();

    const profile = buildProfileResponse(userDoc);

    return NextResponse.json({
      success: true,
      data: profile,
      profile,
    });
  } catch (error) {
    console.error('Profile PUT error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, addressId } = body || {};

    if (!action || !addressId) {
      return NextResponse.json({ error: 'Action and addressId are required' }, { status: 400 });
    }

    await connectToDatabase();
    const userDoc = await User.findById(user.id);
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const addresses = userDoc.addresses as any;
    const address = addresses.id(addressId);
    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    if (action === 'set-default') {
      addresses.forEach((entry: any) => {
        entry.isDefault = entry._id.toString() === addressId;
      });
      await userDoc.save();
      return NextResponse.json({
        success: true,
        profile: buildProfileResponse(userDoc),
      });
    }

    if (action === 'remove') {
      userDoc.addresses = addresses.filter((entry: any) => entry._id.toString() !== addressId) as any;
      if (userDoc.addresses.length > 0 && !userDoc.addresses.some((entry: any) => entry.isDefault)) {
        (userDoc.addresses as any)[0].isDefault = true;
      }
      await userDoc.save();
      return NextResponse.json({
        success: true,
        profile: buildProfileResponse(userDoc),
      });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update address' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const addressId = searchParams.get('addressId');
    if (!addressId) {
      return NextResponse.json({ error: 'addressId is required' }, { status: 400 });
    }

    await connectToDatabase();
    const userDoc = await User.findById(user.id);
    if (!userDoc) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const addresses = userDoc.addresses as any;
    userDoc.addresses = addresses.filter((entry: any) => entry._id.toString() !== addressId) as any;
    if (userDoc.addresses.length > 0 && !userDoc.addresses.some((entry: any) => entry.isDefault)) {
      (userDoc.addresses as any)[0].isDefault = true;
    }

    await userDoc.save();

    return NextResponse.json({
      success: true,
      profile: buildProfileResponse(userDoc),
    });
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete address' }, { status: 500 });
  }
}
