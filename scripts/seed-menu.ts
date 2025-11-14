import dotenv from 'dotenv';
import mongoose from 'mongoose';
import MenuItemModel from '@/models/menu-item-model';
import { IMenuItem } from '@/interfaces';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

/**
 * Seed script for menu items
 * Run with: npm run seed:menu
 */

const menuItems: Partial<IMenuItem>[] = [
  // Food Items - Main Courses
  {
    name: 'Cow Tail Pepper Soup',
    description: 'Spicy and flavorful cow tail pepper soup, slow-cooked to perfection',
    mainCategory: 'food',
    category: 'main-courses',
    price: 3500,
    preparationTime: 30,
    isAvailable: true,
    tags: ['soup', 'spicy', 'traditional'],
    images: [],
  },
  {
    name: 'Asun',
    description: 'Spicy grilled goat meat, a Nigerian delicacy',
    mainCategory: 'food',
    category: 'main-courses',
    price: 2000,
    preparationTime: 25,
    isAvailable: true,
    tags: ['grilled', 'spicy', 'goat meat'],
    images: [],
  },
  {
    name: 'Jollof Rice',
    description: 'Classic Nigerian jollof rice, served per portion',
    mainCategory: 'food',
    category: 'main-courses',
    price: 500,
    preparationTime: 15,
    isAvailable: true,
    tags: ['rice', 'traditional', 'popular'],
    images: [],
    customizations: [
      {
        name: 'Portion Size',
        required: false,
        options: [
          { name: 'Single Portion', price: 0, available: true },
          { name: 'Double Portion', price: 500, available: true },
        ],
      },
    ],
  },
  {
    name: 'Grilled Chicken',
    description: 'Tender grilled chicken, marinated with special spices',
    mainCategory: 'food',
    category: 'main-courses',
    price: 2500,
    preparationTime: 20,
    isAvailable: true,
    tags: ['grilled', 'chicken', 'protein'],
    images: [],
  },
  {
    name: 'Noodles with Eggs',
    description: 'Stir-fried noodles with eggs',
    mainCategory: 'food',
    category: 'main-courses',
    price: 2000,
    preparationTime: 15,
    isAvailable: true,
    tags: ['noodles', 'eggs', 'quick meal'],
    images: [],
    customizations: [
      {
        name: 'Noodles',
        required: false,
        options: [
          { name: 'Single Pack', price: 0, available: true },
          { name: 'Double Pack', price: 500, available: true },
        ],
      },
      {
        name: 'Eggs',
        required: false,
        options: [
          { name: 'Single Egg', price: 0, available: true },
          { name: 'Double Eggs', price: 200, available: true },
        ],
      },
    ],
  },

  // Drinks - Beer (Local)
  {
    name: 'Big Stout',
    description: 'Large bottle of premium stout beer',
    mainCategory: 'drinks',
    category: 'beer-local',
    price: 2000,
    preparationTime: 2,
    isAvailable: true,
    tags: ['beer', 'stout', 'large'],
    images: [],
  },
  {
    name: 'Small Stout',
    description: 'Small bottle of premium stout beer',
    mainCategory: 'drinks',
    category: 'beer-local',
    price: 1200,
    preparationTime: 2,
    isAvailable: true,
    tags: ['beer', 'stout', 'small'],
    images: [],
  },
  {
    name: 'Trophy Lager',
    description: 'Refreshing Trophy lager beer',
    mainCategory: 'drinks',
    category: 'beer-local',
    price: 1200,
    preparationTime: 2,
    isAvailable: true,
    tags: ['beer', 'lager'],
    images: [],
  },
  {
    name: 'Goldberg Lager',
    description: 'Classic Goldberg lager beer',
    mainCategory: 'drinks',
    category: 'beer-local',
    price: 1200,
    preparationTime: 2,
    isAvailable: true,
    tags: ['beer', 'lager'],
    images: [],
  },
  {
    name: 'Maltina',
    description: 'Non-alcoholic malt drink',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 1000,
    preparationTime: 2,
    isAvailable: true,
    tags: ['malt', 'non-alcoholic'],
    images: [],
  },

  // Drinks - Beer (Imported)
  {
    name: 'Heineken',
    description: 'Premium imported Heineken beer',
    mainCategory: 'drinks',
    category: 'beer-imported',
    price: 1500,
    preparationTime: 2,
    isAvailable: true,
    tags: ['beer', 'imported', 'premium'],
    images: [],
  },
  {
    name: 'Big Smirnoff Ice',
    description: 'Large bottle of Smirnoff Ice',
    mainCategory: 'drinks',
    category: 'beer-imported',
    price: 1500,
    preparationTime: 2,
    isAvailable: true,
    tags: ['smirnoff', 'ice', 'large'],
    images: [],
  },
  {
    name: 'Small Smirnoff Ice',
    description: 'Small bottle of Smirnoff Ice',
    mainCategory: 'drinks',
    category: 'beer-imported',
    price: 1200,
    preparationTime: 2,
    isAvailable: true,
    tags: ['smirnoff', 'ice', 'small'],
    images: [],
  },

  // Drinks - Soft Drinks
  {
    name: '5 Alive Pulpy Orange',
    description: 'Refreshing 5 Alive pulpy orange juice',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 1500,
    preparationTime: 2,
    isAvailable: true,
    tags: ['juice', 'orange', 'pulpy'],
    images: [],
  },
  {
    name: '5 Alive Active',
    description: '5 Alive active fruit juice blend',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 2500,
    preparationTime: 2,
    isAvailable: true,
    tags: ['juice', 'active', 'fruit blend'],
    images: [],
  },
  {
    name: 'Power Horse Energy Drink',
    description: 'Energy drink for an instant boost',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 3000,
    preparationTime: 2,
    isAvailable: true,
    tags: ['energy drink', 'boost'],
    images: [],
  },
  {
    name: 'Commando Energy Drink (Small)',
    description: 'Small can of Commando energy drink',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 500,
    preparationTime: 2,
    isAvailable: true,
    tags: ['energy drink', 'small'],
    images: [],
  },
  {
    name: 'Pepsi',
    description: 'Classic Pepsi cola',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 700,
    preparationTime: 2,
    isAvailable: true,
    tags: ['cola', 'soft drink'],
    images: [],
  },
  {
    name: 'Coca-Cola',
    description: 'Classic Coca-Cola',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 700,
    preparationTime: 2,
    isAvailable: true,
    tags: ['cola', 'soft drink'],
    images: [],
  },
  {
    name: 'Sweetened Yogurt',
    description: 'Creamy sweetened yogurt',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 2500,
    preparationTime: 2,
    isAvailable: true,
    tags: ['yogurt', 'dairy', 'sweet'],
    images: [],
  },
  {
    name: 'Vanilla Yogurt',
    description: 'Smooth vanilla flavored yogurt',
    mainCategory: 'drinks',
    category: 'soft-drinks',
    price: 2500,
    preparationTime: 2,
    isAvailable: true,
    tags: ['yogurt', 'dairy', 'vanilla'],
    images: [],
  },
];

async function seedMenu() {
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

    // Clear existing menu items (optional - comment out if you want to keep existing items)
    console.log('Clearing existing menu items...');
    await MenuItemModel.deleteMany({});
    console.log('Existing menu items cleared');

    // Insert new menu items
    console.log('Inserting menu items...');
    const result = await MenuItemModel.insertMany(menuItems);
    console.log(`Successfully inserted ${result.length} menu items`);

    // Display summary
    const foodCount = result.filter((item) => item.mainCategory === 'food').length;
    const drinksCount = result.filter((item) => item.mainCategory === 'drinks').length;
    console.log(`\nSummary:`);
    console.log(`- Food items: ${foodCount}`);
    console.log(`- Drink items: ${drinksCount}`);
    console.log(`- Total items: ${result.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding menu:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the seed function
seedMenu();
