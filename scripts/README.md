# Database Scripts

This directory contains scripts for seeding and managing the database.

## Menu Seeding

### Prerequisites

1. Ensure your `.env.local` file has the `MONGODB_URI` variable set
2. Install dependencies: `npm install`

### Usage

To seed the menu with test items:

```bash
npm run seed:menu
```

### What it does

The seed script will:
1. Connect to your MongoDB database
2. **Clear all existing menu items** (comment out the `deleteMany` line if you want to keep existing items)
3. Insert 22 menu items across the following categories:
   - **Food (Main Courses)**: 5 items
   - **Drinks (Beer - Local)**: 5 items
   - **Drinks (Beer - Imported)**: 3 items
   - **Drinks (Soft Drinks)**: 9 items

### Menu Items Included

#### Food
- Cow Tail Pepper Soup (₦3,500)
- Asun (₦2,000)
- Jollof Rice (₦500/portion with double portion option)
- Grilled Chicken (₦2,500)
- Noodles with Eggs (₦2,000 with customization options)

#### Drinks - Beer (Local)
- Big Stout (₦2,000)
- Small Stout (₦1,200)
- Trophy Lager (₦1,200)
- Goldberg Lager (₦1,200)
- Maltina (₦1,000)

#### Drinks - Beer (Imported)
- Heineken (₦1,500)
- Big Smirnoff Ice (₦1,500)
- Small Smirnoff Ice (₦1,200)

#### Drinks - Soft Drinks
- 5 Alive Pulpy Orange (₦1,500)
- 5 Alive Active (₦2,500)
- Power Horse Energy Drink (₦3,000)
- Commando Energy Drink Small (₦500)
- Pepsi (₦700)
- Coca-Cola (₦700)
- Sweetened Yogurt (₦2,500)
- Vanilla Yogurt (₦2,500)

### Customization Options

Some items include customization options:
- **Jollof Rice**: Single or Double portion
- **Noodles with Eggs**: Single/Double noodles, Single/Double eggs

### Modifying the Script

To keep existing menu items instead of clearing them:

1. Open `/scripts/seed-menu.ts`
2. Comment out or remove these lines:
   ```typescript
   console.log('Clearing existing menu items...');
   await MenuItemModel.deleteMany({});
   console.log('Existing menu items cleared');
   ```

To add more items or modify existing ones, edit the `menuItems` array in `/scripts/seed-menu.ts`.

### Troubleshooting

**Error: MONGODB_URI environment variable is not set**
- Ensure your `.env.local` file exists and contains `MONGODB_URI`

**Error: Cannot find module 'tsx'**
- Run `npm install` to install all dependencies including tsx

**Connection timeout**
- Check your MongoDB connection string
- Ensure your IP is whitelisted in MongoDB Atlas (if using cloud)

## User Data Deletion

### Usage

To delete all orders and tabs for a specific user:

```bash
npm run delete:user-data <email>
```

**Example:**
```bash
npm run delete:user-data adekunle@gmail.com
```

### What it does

The script will:
1. Find the user by email address
2. Delete all orders associated with the user (both registered and guest orders)
3. Delete all tabs associated with the user (both registered and guest tabs)
4. Provide a summary of deleted items

### Safety Features

- Validates that the user exists before proceeding
- Shows a summary of what will be deleted before execution
- Handles both registered users (by userId) and guest orders (by email)
- Properly closes database connection

### Output Example

```
🗑️  Deleting data for user: adekunle@gmail.com (ID: 507f1f77bcf86cd799439011)
📦 Deleted 5 orders
📋 Deleted 2 tabs
📦 Deleted 3 guest orders with email adekunle@gmail.com
📋 Deleted 1 guest tabs with email adekunle@gmail.com

✅ User data deletion completed successfully!

📊 Summary for adekunle@gmail.com:
   - Orders: 5 (registered) + 3 (guest)
   - Tabs: 2 (registered) + 1 (guest)
```
