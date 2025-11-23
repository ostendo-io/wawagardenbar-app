import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Order from '@/models/order-model';
import TabModel from '@/models/tab-model';
import UserModel from '@/models/user-model';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * Delete all orders and tabs for a given user email
 * Run with: npx tsx scripts/delete-user-data.ts <email>
 * 
 * Example: npx tsx scripts/delete-user-data.ts adekunle@gmail.com
 */
async function deleteUserData(email: string) {
  try {
    // Validate email argument
    if (!email) {
      console.error('❌ Please provide an email address as an argument');
      console.log('Usage: npx tsx scripts/delete-user-data.ts <email>');
      console.log('Example: npx tsx scripts/delete-user-data.ts adekunle@gmail.com');
      process.exit(1);
    }

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    const dbName = process.env.MONGODB_DB_NAME;

    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }

    if (!dbName) {
      throw new Error('MONGODB_DB_NAME environment variable is not set');
    }

    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, { dbName });
    console.log(`Connected to MongoDB (database: ${dbName})`);

    // Find the user first
    const user = await UserModel.findOne({ email });
    if (!user) {
      console.error(`❌ User with email "${email}" not found`);
      process.exit(1);
    }

    console.log(`\n🗑️  Deleting data for user: ${email} (ID: ${user._id})`);

    // Delete all orders for this user
    const ordersResult = await Order.deleteMany({ userId: user._id });
    console.log(`📦 Deleted ${ordersResult.deletedCount} orders`);

    // Delete all tabs for this user
    const tabsResult = await TabModel.deleteMany({ userId: user._id });
    console.log(`📋 Deleted ${tabsResult.deletedCount} tabs`);

    // Also delete any orders/tabs where the user is the customer (for guest orders)
    const customerOrdersResult = await Order.deleteMany({ 
      customerEmail: email,
      userId: { $exists: false } // Only delete guest orders
    });
    if (customerOrdersResult.deletedCount > 0) {
      console.log(`📦 Deleted ${customerOrdersResult.deletedCount} guest orders with email ${email}`);
    }

    const customerTabsResult = await TabModel.deleteMany({ 
      customerEmail: email,
      userId: { $exists: false } // Only delete guest tabs
    });
    if (customerTabsResult.deletedCount > 0) {
      console.log(`📋 Deleted ${customerTabsResult.deletedCount} guest tabs with email ${email}`);
    }

    console.log('\n✅ User data deletion completed successfully!');
    console.log(`\n📊 Summary for ${email}:`);
    console.log(`   - Orders: ${ordersResult.deletedCount} (registered) + ${customerOrdersResult.deletedCount} (guest)`);
    console.log(`   - Tabs: ${tabsResult.deletedCount} (registered) + ${customerTabsResult.deletedCount} (guest)`);

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting user data:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];
deleteUserData(email);
