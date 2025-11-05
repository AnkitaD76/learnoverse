import 'dotenv/config';
import connectDB from '../db/connectDB.js';
import Role from '../models/Role.js';
import User from '../models/User.js';

const MONGO_URI =
    process.env.MONGO_URI;

/**
 * Seed default roles and optionally create admin user
 */
const seedDatabase = async () => {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to database
        await connectDB(MONGO_URI);

        // Seed roles
        console.log('📝 Seeding roles...');
        await Role.seedDefaultRoles();

        // Check if any users exist
        const userCount = await User.countDocuments();

        if (userCount === 0) {
            console.log('\n👤 No users found. Creating default admin user...');

            const adminUser = await User.create({
                name: 'Admin User',
                email: 'admin@learnoverse.com',
                password: 'Admin@123456', // Change this in production!
                role: 'admin',
                isVerified: true,
                verified: new Date(),
                status: 'active',
            });

            console.log('✅ Admin user created:');
            console.log(`   Email: ${adminUser.email}`);
            console.log('   Password: Admin@123456');
            console.log(`   Role: ${adminUser.role}`);
            console.log(
                '\n⚠️  IMPORTANT: Change the admin password immediately!\n'
            );
        } else {
            console.log(
                `\nℹ️  Found ${userCount} existing user(s). Skipping user creation.\n`
            );
        }

        console.log('✅ Database seeding completed successfully!\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
};

// Run seeder
seedDatabase();
