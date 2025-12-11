// IMPORTANT: Load environment variables FIRST before any other imports
import { config } from 'dotenv';
import { resolve } from 'path';

const envPath = resolve(process.cwd(), '.env.local');
const result = config({ path: envPath });

if (result.error) {
  console.error('⚠️  Warning: Could not load .env.local file');
  console.error('   Path:', envPath);
  console.error('   Error:', result.error.message);
  process.exit(1);
}

// Now import modules that depend on environment variables
import { connectDB } from '@/lib/mongodb';
import { UserModel } from '@/models';
import bcrypt from 'bcrypt';

async function updateAdminCredentials() {
  try {
    console.log('🔧 Connecting to database...');
    await connectDB();

    // Get the email from command line or use default
    const email = process.argv[2] || process.env.ADMIN_EMAIL || 'william@ostendo.io';
    const username = process.argv[3] || process.env.ADMIN_USERNAME || 'superadmin';
    const password = process.argv[4] || process.env.ADMIN_PASSWORD || 'Admin@123!';

    console.log(`\n📝 Updating admin credentials for: ${email}\n`);

    // Find the user
    const user = await UserModel.findOne({ 
      email,
      role: 'super-admin',
      accountStatus: 'active',
    });

    if (!user) {
      console.error(`❌ No super-admin found with email: ${email}`);
      console.log('\n💡 Available super-admins:');
      const admins = await UserModel.find({ 
        role: 'super-admin',
        accountStatus: 'active',
      }).select('email username');
      
      admins.forEach((admin) => {
        console.log(`   - ${admin.email} (username: ${admin.username || 'not set'})`);
      });
      process.exit(1);
    }

    // Check if username already exists for another user
    if (username) {
      const existingUser = await UserModel.findOne({ 
        username,
        _id: { $ne: user._id },
      });

      if (existingUser) {
        console.error(`❌ Username "${username}" is already taken by another user`);
        process.exit(1);
      }
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update the user
    user.username = username;
    user.password = hashedPassword;
    user.isAdmin = true;
    user.mustChangePassword = false;
    user.passwordChangedAt = new Date();
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = undefined;

    await user.save();

    console.log('✅ Admin credentials updated successfully!\n');
    console.log('📋 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`\n🔐 Login URL: http://localhost:3000/admin/login`);
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error updating admin credentials:', error.message);
    console.error(error);
    process.exit(1);
  }
}

updateAdminCredentials();
