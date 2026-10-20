import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create demo user
  const passwordHash = await bcrypt.hash('Demo123!', 12);
  
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@khaanada.pk' },
    update: {},
    create: {
      email: 'demo@khaanada.pk',
      phone: '+923001234567',
      name: 'Demo User',
      passwordHash,
      role: UserRole.CUSTOMER,
      emailVerified: true,
      phoneVerified: true,
    },
  });

  console.log(`✅ Created demo user: ${demoUser.email}`);

  // Create demo addresses
  const address1 = await prisma.address.upsert({
    where: { id: 'addr-1' },
    update: {},
    create: {
      id: 'addr-1',
      userId: demoUser.id,
      label: 'Home',
      street: '45-B, Street 7, DHA Phase 5',
      area: 'DHA',
      city: 'Lahore',
      isDefault: true,
    },
  });

  const address2 = await prisma.address.upsert({
    where: { id: 'addr-2' },
    update: {},
    create: {
      id: 'addr-2',
      userId: demoUser.id,
      label: 'Office',
      street: '12, Block C, Blue Area',
      area: 'Blue Area',
      city: 'Islamabad',
      isDefault: false,
    },
  });

  console.log(`✅ Created ${2} addresses`);

  // Create restaurants
  const restaurants = [
    {
      id: 'r1',
      name: 'Lahori Chargha',
      nameUrdu: 'لاہوری چرغہ',
      description: 'Authentic Lahori chargha and traditional Pakistani BBQ dishes',
      descriptionUrdu: 'اصل لاہوری چرغہ اور روایتی پاکستانی بی بی کیو پکوان',
      phone: '+923001111111',
      address: 'MM Alam Road, Gulberg III',
      city: 'Lahore',
      area: 'Gulberg',
      cuisine: ['Pakistani', 'BBQ & Grill'],
      rating: 4.7,
      reviewCount: 2341,
      deliveryTime: '25-35 min',
      deliveryFee: 8000, // 80 PKR in paisa
      minOrder: 30000, // 300 PKR in paisa
      imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&h=400&fit=crop',
      isOpen: true,
      isApproved: true,
      isFeatured: true,
      openingHours: [
        { day: 'Mon-Thu', open: '11:00', close: '23:00' },
        { day: 'Fri-Sat', open: '11:00', close: '00:00' },
        { day: 'Sun', open: '12:00', close: '23:00' },
      ],
    },
    {
      id: 'r2',
      name: 'Biryani House',
      nameUrdu: 'بریانی ہاؤس',
      description: 'Famous for our aromatic Sindhi biryani',
      descriptionUrdu: 'خوشبودار سندھی بریانی کے لیے مشہور',
      phone: '+923002222222',
      address: 'Block D, North Nazimabad',
      city: 'Karachi',
      area: 'North Nazimabad',
      cuisine: ['Biryani & Rice', 'Pakistani'],
      rating: 4.5,
      reviewCount: 5621,
      deliveryTime: '30-40 min',
      deliveryFee: 6000,
      minOrder: 25000,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&h=400&fit=crop',
      isOpen: true,
      isApproved: true,
      isFeatured: true,
      openingHours: [{ day: 'Mon-Sun', open: '10:00', close: '01:00' }],
    },
  ];

  for (const restaurant of restaurants) {
    await prisma.restaurant.upsert({
      where: { id: restaurant.id },
      update: {},
      create: {
        ...restaurant,
        ownerId: demoUser.id, // Using demo user as owner for simplicity
      },
    });
  }

  console.log(`✅ Created ${restaurants.length} restaurants`);

  // Create menu categories and items for first restaurant
  const category1 = await prisma.menuCategory.upsert({
    where: { id: 'cat-1' },
    update: {},
    create: {
      id: 'cat-1',
      restaurantId: 'r1',
      name: 'Main Course',
      nameUrdu: 'مین کورس',
      sortOrder: 1,
    },
  });

  const category2 = await prisma.menuCategory.upsert({
    where: { id: 'cat-2' },
    update: {},
    create: {
      id: 'cat-2',
      restaurantId: 'r1',
      name: 'BBQ',
      nameUrdu: 'بی بی کیو',
      sortOrder: 2,
    },
  });

  const menuItems = [
    {
      id: 'm1',
      categoryId: category1.id,
      name: 'Full Chargha (Chicken)',
      nameUrdu: 'فل چرغہ',
      description: 'Whole chicken marinated in special spices and deep fried',
      descriptionUrdu: 'مخصوص مصالحوں میں میرینیٹ کیا ہوا مکمل مرغی',
      price: 145000, // 1450 PKR in paisa
      imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
      isVegetarian: false,
      isVegan: false,
      isSpicy: true,
      isAvailable: true,
      isPopular: true,
    },
    {
      id: 'm2',
      categoryId: category1.id,
      name: 'Half Chargha',
      nameUrdu: 'ہاف چرغہ',
      description: 'Half chicken chargha with crispy skin',
      descriptionUrdu: 'آدھا چرغہ کرکرا اور رسیلا',
      price: 85000,
      imageUrl: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=400&h=300&fit=crop',
      isVegetarian: false,
      isVegan: false,
      isSpicy: true,
      isAvailable: true,
      isPopular: true,
    },
    {
      id: 'm3',
      categoryId: category2.id,
      name: 'Chicken Tikka',
      nameUrdu: 'چکن تکہ',
      description: 'Boneless chicken pieces marinated and grilled',
      descriptionUrdu: 'بون لیس چکن کوئلے پر گرل کیا ہوا',
      price: 65000,
      imageUrl: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop',
      isVegetarian: false,
      isVegan: false,
      isSpicy: true,
      isAvailable: true,
      isPopular: false,
    },
  ];

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: item,
    });
  }

  console.log(`✅ Created ${menuItems.length} menu items`);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
