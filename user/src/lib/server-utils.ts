import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import connectToDatabase from './mongodb';
import User from '@/models/User';

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.user) return null;

  await connectToDatabase();
  const user = await User.findById(session.user.id).select('name email phone profileImage role');

  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.profileImage,
    role: user.role,
  };
}
