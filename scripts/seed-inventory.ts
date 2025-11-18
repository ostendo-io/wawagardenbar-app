import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MenuItemModel from '@/models/menu-item-model';
import InventoryModel from '@/models/inventory-model';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * Seed inventory for existing menu items
 * Run with: npx tsx scripts/seed-inventory.ts
 */
async function seedInventory() {
  try {
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

    console.log('\n🌱 Seeding inventory data...');

    // Get all menu items
    const menuItems = await MenuItemModel.find();
    console.log(`Found ${menuItems.length} menu items`);

    if (menuItems.length === 0) {
      console.log('⚠️  No menu items found. Please seed menu items first.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Clear existing inventory
    await InventoryModel.deleteMany({});
    console.log('Cleared existing inventory');

    // Create inventory for each menu item
    const inventoryData = menuItems.map((item) => {
      // Different stock levels based on category
      let currentStock = 50;
      let minimumStock = 10;
      let maximumStock = 100;
      let unit = 'units';
      let costPerUnit = item.price * 0.4; // 40% of selling price

      // Adjust for food items
      if (item.mainCategory === 'food') {
        currentStock = Math.floor(Math.random() * 30) + 20; // 20-50
        minimumStock = 10;
        maximumStock = 80;
        unit = 'portions';
        costPerUnit = item.price * 0.35;
      }

      // Adjust for drinks
      if (item.mainCategory === 'drinks') {
        currentStock = Math.floor(Math.random() * 50) + 30; // 30-80
        minimumStock = 15;
        maximumStock = 150;
        unit = 'bottles';
        costPerUnit = item.price * 0.45;
      }

      // Create some low stock items for testing
      if (Math.random() < 0.2) {
        currentStock = Math.floor(Math.random() * 8) + 2; // 2-10 (low stock)
      }

      // Create some out of stock items for testing
      if (Math.random() < 0.1) {
        currentStock = 0; // Out of stock
      }

      return {
        menuItemId: item._id,
        currentStock,
        minimumStock,
        maximumStock,
        unit,
        costPerUnit,
        autoReorderEnabled: true,
        reorderQuantity: maximumStock - minimumStock,
        supplier: item.mainCategory === 'food' ? 'Local Food Supplier' : 'Beverage Distributors Ltd',
        lastRestocked: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random date within last week
      };
    });

    // Insert inventory records
    const createdInventory = await InventoryModel.insertMany(inventoryData);
    console.log(`✅ Created ${createdInventory.length} inventory records`);

    // Show summary
    const stats = {
      total: createdInventory.length,
      inStock: createdInventory.filter((i) => i.status === 'in-stock').length,
      lowStock: createdInventory.filter((i) => i.status === 'low-stock').length,
      outOfStock: createdInventory.filter((i) => i.status === 'out-of-stock').length,
    };

    console.log('\n📊 Inventory Summary:');
    console.log(`   Total Items: ${stats.total}`);
    console.log(`   In Stock: ${stats.inStock}`);
    console.log(`   Low Stock: ${stats.lowStock}`);
    console.log(`   Out of Stock: ${stats.outOfStock}`);

    console.log('\n✅ Inventory seeding completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('1. Go to /dashboard/inventory');
    console.log('2. View stock levels and alerts');
    console.log('3. Check low stock and out of stock items\n');

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding inventory:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

seedInventory();
