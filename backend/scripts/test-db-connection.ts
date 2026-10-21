import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();

async function testConnection() {
  console.log('🔍 Testing Supabase database connection...\n');

  try {
    // Test 1: Basic connection
    console.log('✅ Test 1: Connecting to database...');
    await prisma.$connect();
    console.log('   ✓ Connected successfully\n');

    // Test 2: Query users table
    console.log('✅ Test 2: Querying User table...');
    const userCount = await prisma.user.count();
    console.log(`   ✓ Found ${userCount} user(s)\n`);

    // Test 3: Query restaurants
    console.log('✅ Test 3: Querying Restaurant table...');
    const restaurantCount = await prisma.restaurant.count();
    console.log(`   ✓ Found ${restaurantCount} restaurant(s)\n`);

    // Test 4: Query menu items
    console.log('✅ Test 4: Querying MenuItem table...');
    const menuItemCount = await prisma.menuItem.count();
    console.log(`   ✓ Found ${menuItemCount} menu item(s)\n`);

    // Test 5: Query orders
    console.log('✅ Test 5: Querying Order table...');
    const orderCount = await prisma.order.count();
    console.log(`   ✓ Found ${orderCount} order(s)\n`);

    // Test 6: Verify demo user exists
    console.log('✅ Test 6: Verifying demo user...');
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@khaanada.pk' },
    });
    
    if (demoUser) {
      console.log(`   ✓ Demo user found: ${demoUser.name} (${demoUser.email})`);
      console.log(`   ✓ User ID: ${demoUser.id}`);
      console.log(`   ✓ Role: ${demoUser.role}\n`);
    } else {
      console.log('   ⚠️  Demo user not found (run seed script first)\n');
    }

    // Test 7: Test write operation (create and delete test record)
    console.log('✅ Test 7: Testing write permissions...');
    const testAddress = await prisma.address.create({
      data: {
        userId: demoUser?.id || '00000000-0000-0000-0000-000000000000',
        label: 'Connection Test',
        street: 'Test Street',
        area: 'Test Area',
        city: 'Test City',
        isDefault: false,
      },
    });
    
    await prisma.address.delete({
      where: { id: testAddress.id },
    });
    
    console.log('   ✓ Write operations successful\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ ALL TESTS PASSED!');
    console.log('═══════════════════════════════════════════════════');
    console.log('\n📊 Database Summary:');
    console.log(`   • Users: ${userCount}`);
    console.log(`   • Restaurants: ${restaurantCount}`);
    console.log(`   • Menu Items: ${menuItemCount}`);
    console.log(`   • Orders: ${orderCount}`);
    console.log('\n🎉 Your Supabase database is working correctly!\n');

  } catch (error) {
    console.error('\n❌ CONNECTION TEST FAILED\n');
    console.error('Error details:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Can\'t reach database server')) {
        console.error('\n💡 Hint: Check your DATABASE_URL in .env file');
        console.error('   - Verify the connection string format');
        console.error('   - Ensure Supabase project is active');
        console.error('   - Check network connectivity');
      } else if (error.message.includes('password authentication failed')) {
        console.error('\n💡 Hint: Password authentication failed');
        console.error('   - Verify the password in your connection string');
        console.error('   - Check if the prisma user exists in Supabase');
      } else if (error.message.includes('does not exist')) {
        console.error('\n💡 Hint: Database tables not found');
        console.error('   - Run migrations: npm run prisma:migrate');
        console.error('   - Run seed: npm run prisma:seed');
      }
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testConnection();
