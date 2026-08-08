import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const categories = [
  { name: 'Electronics', slug: 'electronics', description: 'Laptops, cameras, gaming consoles and more', icon: '💻' },
  { name: 'Furniture', slug: 'furniture', description: 'Sofas, tables, chairs and home furnishings', icon: '🪑' },
  { name: 'Sports', slug: 'sports', description: 'Bikes, fitness equipment and outdoor gear', icon: '⚽' },
  { name: 'Vehicles', slug: 'vehicles', description: 'Cars, bikes and commercial vehicles', icon: '🚗' },
  { name: 'Tools', slug: 'tools', description: 'Power tools, hand tools and equipment', icon: '🔧' },
  { name: 'Party & Events', slug: 'party-events', description: 'Sound systems, lighting and event supplies', icon: '🎉' },
  { name: 'Clothing', slug: 'clothing', description: 'Designer wear, costumes and accessories', icon: '👔' },
  { name: 'Musical Instruments', slug: 'musical-instruments', description: 'Guitars, keyboards and DJ equipment', icon: '🎸' },
];

const products = [
  {
    name: 'MacBook Pro 16" M3 Max',
    slug: 'macbook-pro-16-m3-max',
    description: 'Experience unmatched performance with the MacBook Pro 16-inch featuring the M3 Max chip. Perfect for video editing, 3D rendering, and professional workflows.',
    shortDescription: 'Powerhouse laptop for creative professionals',
    categorySlug: 'electronics',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'],
    dailyPrice: 1500,
    weeklyPrice: 8000,
    monthlyPrice: 25000,
    securityDeposit: 25000,
    originalPrice: 249900,
    ratingAvg: 4.8,
    ratingCount: 342,
    totalStock: 15,
    availableStock: 12,
    specifications: [{ key: 'Chip', value: 'M3 Max' }, { key: 'RAM', value: '36GB Unified' }, { key: 'Storage', value: '1TB SSD' }],
    features: ['M3 Max chip', 'Liquid Retina XDR display', 'All-day battery'],
    tags: ['laptop', 'apple', 'professional'],
    isBestseller: true,
  },
  {
    name: 'Sony A7R V Camera',
    slug: 'sony-a7r-v-camera',
    description: 'Capture breathtaking photos and 8K videos with the Sony A7R V.',
    shortDescription: '61MP full-frame mirrorless camera',
    categorySlug: 'electronics',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800'],
    dailyPrice: 2500,
    weeklyPrice: 14000,
    monthlyPrice: 40000,
    securityDeposit: 50000,
    originalPrice: 349990,
    ratingAvg: 4.9,
    ratingCount: 189,
    totalStock: 8,
    availableStock: 6,
    specifications: [{ key: 'Sensor', value: '61MP Full-Frame' }, { key: 'Video', value: '8K 24p' }],
    features: ['AI autofocus', '8K video', 'Weather-sealed body'],
    tags: ['camera', 'sony', 'photography'],
    isBestseller: true,
  },
  {
    name: 'Herman Miller Aeron Chair',
    slug: 'herman-miller-aeron-chair',
    description: 'The gold standard in ergonomic seating.',
    shortDescription: 'Premium ergonomic office chair',
    categorySlug: 'furniture',
    images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800'],
    dailyPrice: 300,
    weeklyPrice: 1500,
    monthlyPrice: 4000,
    securityDeposit: 8000,
    originalPrice: 135000,
    ratingAvg: 4.7,
    ratingCount: 567,
    totalStock: 25,
    availableStock: 20,
    specifications: [{ key: 'Material', value: 'Pellicle Mesh' }, { key: 'Size', value: 'Medium' }],
    features: ['Ergonomic design', 'Breathable mesh', 'PostureFit SL support'],
    tags: ['chair', 'office', 'ergonomic'],
    isBestseller: true,
  },
  {
    name: 'Trek Domane SL 7 Road Bike',
    slug: 'trek-domane-sl-7',
    description: 'Dominate the road with the Trek Domane SL 7.',
    shortDescription: 'Carbon road bike with electronic shifting',
    categorySlug: 'sports',
    images: ['https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800'],
    dailyPrice: 800,
    weeklyPrice: 4000,
    monthlyPrice: 12000,
    securityDeposit: 15000,
    originalPrice: 325000,
    ratingAvg: 4.6,
    ratingCount: 98,
    totalStock: 6,
    availableStock: 4,
    specifications: [{ key: 'Frame', value: 'OCLV 500 Carbon' }, { key: 'Groupset', value: 'Shimano Ultegra Di2' }],
    features: ['Carbon frame', 'Electronic shifting', 'IsoSpeed technology'],
    tags: ['bike', 'road', 'cycling'],
    isBestseller: false,
  },
  {
    name: 'PlayStation 5 Pro Bundle',
    slug: 'playstation-5-pro-bundle',
    description: 'Experience next-gen gaming with the PlayStation 5 Pro.',
    shortDescription: 'Next-gen gaming console bundle',
    categorySlug: 'electronics',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'],
    dailyPrice: 500,
    weeklyPrice: 2500,
    monthlyPrice: 7000,
    securityDeposit: 10000,
    originalPrice: 59990,
    ratingAvg: 4.9,
    ratingCount: 823,
    totalStock: 10,
    availableStock: 7,
    specifications: [{ key: 'GPU', value: '16.7 TFLOPS' }, { key: 'Storage', value: '2TB SSD' }],
    features: ['4K 120fps gaming', 'Ray tracing', 'DualSense haptics'],
    tags: ['gaming', 'playstation', 'console'],
    isBestseller: true,
  },
  {
    name: 'Martin D-28 Acoustic Guitar',
    slug: 'martin-d-28-acoustic-guitar',
    description: 'The iconic Martin D-28 has been the choice of legendary musicians.',
    shortDescription: 'Iconic dreadnought acoustic guitar',
    categorySlug: 'musical-instruments',
    images: ['https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800'],
    dailyPrice: 400,
    weeklyPrice: 2000,
    monthlyPrice: 6000,
    securityDeposit: 12000,
    originalPrice: 285000,
    ratingAvg: 4.8,
    ratingCount: 156,
    totalStock: 5,
    availableStock: 3,
    specifications: [{ key: 'Top', value: 'Sitka Spruce' }, { key: 'Back', value: 'Rosewood' }],
    features: ['Solid wood construction', 'Bone nut and saddle', 'Hardshell case included'],
    tags: ['guitar', 'acoustic', 'martin'],
    isBestseller: false,
  },
];

async function main() {
  console.log('Seeding database...');

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const createdCategories = await Promise.all(
    categories.map((c) => prisma.category.create({ data: c }))
  );
  console.log(`${createdCategories.length} categories created`);

  const catMap = Object.fromEntries(createdCategories.map((c) => [c.slug, c.id]));

  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.shortDescription,
        categoryId: catMap[p.categorySlug],
        images: p.images,
        dailyPrice: p.dailyPrice,
        weeklyPrice: p.weeklyPrice,
        monthlyPrice: p.monthlyPrice,
        securityDeposit: p.securityDeposit,
        originalPrice: p.originalPrice,
        ratingAvg: p.ratingAvg,
        ratingCount: p.ratingCount,
        totalStock: p.totalStock,
        availableStock: p.availableStock,
        specifications: p.specifications,
        features: p.features,
        tags: p.tags,
        isBestseller: p.isBestseller,
      },
    });
  }
  console.log(`${products.length} products created`);

  const hashedPassword = await bcrypt.hash('password123', 12);
  await prisma.user.create({
    data: {
      name: 'Demo User',
      email: 'demo@rentalhub.com',
      password: hashedPassword,
      phone: '9876543210',
    },
  });
  console.log('Demo user created (demo@rentalhub.com / password123)');

  console.log('Seed completed!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
