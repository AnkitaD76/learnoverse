import dotenv from "dotenv";
dotenv.config();

import connectDB from "../db/connectDB.js";
import { User, Role, RefreshToken } from "../models/index.js";

const roles = [
  {
    name: "admin",
    displayName: "Administrator",
    description: "Full system access with all permissions",
    permissions: [
      "users.create",
      "users.read",
      "users.update",
      "users.delete",
      "roles.create",
      "roles.read",
      "roles.update",
      "roles.delete",
      "courses.create",
      "courses.read",
      "courses.update",
      "courses.delete",
      "content.create",
      "content.read",
      "content.update",
      "content.delete",
      "system.manage",
    ],
    priority: 100,
    isActive: true,
  },
  {
    name: "instructor",
    displayName: "Instructor",
    description: "Can create and manage courses and content",
    permissions: [
      "courses.create",
      "courses.read",
      "courses.update",
      "content.create",
      "content.read",
      "content.update",
      "students.read",
    ],
    priority: 50,
    isActive: true,
  },
  {
    name: "student",
    displayName: "Student",
    description: "Can enroll in and view courses",
    permissions: ["courses.read", "content.read", "profile.update"],
    priority: 10,
    isActive: true,
  },
  {
    name: "moderator",
    displayName: "Moderator",
    description: "Can moderate content and manage users",
    permissions: [
      "users.read",
      "users.update",
      "courses.read",
      "content.read",
      "content.update",
      "content.delete",
    ],
    priority: 30,
    isActive: true,
  },
];

const users = [
  {
    name: "Admin User",
    email: "admin@learnoverse.com",
    password: "Admin@123456",
    role: "admin",
    isVerified: true,
    isActive: true,
    phone: "+1234567890",
    country: "United States",
    city: "New York",
    gender: "prefer-not-to-say",
    bio: "System administrator with full access to all features.",
    educationLevel: "graduate",
    institution: "Learnoverse University",
    fieldOfStudy: "Computer Science",
    interests: ["Technology", "Education", "Management"],
  },
  {
    name: "John Instructor",
    email: "john.instructor@learnoverse.com",
    password: "Instructor@123",
    role: "instructor",
    isVerified: true,
    isActive: true,
    phone: "+1234567891",
    country: "United States",
    city: "San Francisco",
    gender: "male",
    dateOfBirth: new Date("1985-05-15"),
    bio: "Experienced instructor specializing in web development and programming.",
    educationLevel: "postgraduate",
    institution: "Stanford University",
    fieldOfStudy: "Software Engineering",
    interests: [
      "Web Development",
      "JavaScript",
      "React",
      "Node.js",
      "Teaching",
    ],
  },
  {
    name: "Sarah Instructor",
    email: "sarah.instructor@learnoverse.com",
    password: "Instructor@123",
    role: "instructor",
    isVerified: true,
    isActive: true,
    phone: "+1234567892",
    country: "United Kingdom",
    city: "London",
    gender: "female",
    dateOfBirth: new Date("1988-08-22"),
    bio: "Data science and machine learning expert with 10+ years of experience.",
    educationLevel: "doctorate",
    institution: "Oxford University",
    fieldOfStudy: "Data Science",
    interests: [
      "Machine Learning",
      "Python",
      "Data Analysis",
      "AI",
      "Statistics",
    ],
  },
  {
    name: "Alice Student",
    email: "alice.student@learnoverse.com",
    password: "Student@123",
    role: "student",
    isVerified: true,
    isActive: true,
    phone: "+1234567893",
    country: "Canada",
    city: "Toronto",
    gender: "female",
    dateOfBirth: new Date("2000-03-10"),
    bio: "Enthusiastic learner passionate about web development.",
    educationLevel: "undergraduate",
    institution: "University of Toronto",
    fieldOfStudy: "Computer Science",
    interests: ["Web Development", "Frontend", "Design", "JavaScript"],
  },
  {
    name: "Bob Student",
    email: "bob.student@learnoverse.com",
    password: "Student@123",
    role: "student",
    isVerified: true,
    isActive: true,
    phone: "+1234567894",
    country: "Australia",
    city: "Sydney",
    gender: "male",
    dateOfBirth: new Date("1998-11-25"),
    bio: "Aspiring data scientist looking to master Python and machine learning.",
    educationLevel: "undergraduate",
    institution: "University of Sydney",
    fieldOfStudy: "Information Technology",
    interests: ["Data Science", "Python", "Machine Learning", "Analytics"],
  },
  {
    name: "Emma Student",
    email: "emma.student@learnoverse.com",
    password: "Student@123",
    role: "student",
    isVerified: false,
    isActive: true,
    phone: "+1234567895",
    country: "Germany",
    city: "Berlin",
    gender: "female",
    dateOfBirth: new Date("2001-07-14"),
    bio: "New to programming, excited to learn!",
    educationLevel: "high-school",
    institution: "Berlin High School",
    fieldOfStudy: "General Studies",
    interests: ["Programming", "Web Design", "Technology"],
  },
  {
    name: "Mike Moderator",
    email: "mike.moderator@learnoverse.com",
    password: "Moderator@123",
    role: "moderator",
    isVerified: true,
    isActive: true,
    phone: "+1234567896",
    country: "United States",
    city: "Los Angeles",
    gender: "male",
    dateOfBirth: new Date("1990-01-05"),
    bio: "Community moderator ensuring quality content and user experience.",
    educationLevel: "graduate",
    institution: "UCLA",
    fieldOfStudy: "Education",
    interests: ["Community Management", "Education", "Communication"],
  },
];

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Connect to database
    await connectDB(process.env.MONGO_URI);
    console.log("✅ Connected to database");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Role.deleteMany({});
    await RefreshToken.deleteMany({});
    console.log("✅ Existing data cleared");

    // Create roles
    console.log("📝 Creating roles...");
    const createdRoles = await Role.insertMany(roles);
    console.log(`✅ Created ${createdRoles.length} roles`);

    // Create a map of role names to IDs
    const roleMap = {};
    createdRoles.forEach((role) => {
      roleMap[role.name] = role._id;
    });

    // Create users with correct role IDs
    console.log("👥 Creating users...");
    const usersWithRoleIds = users.map((user) => ({
      ...user,
      role: roleMap[user.role],
    }));

    const createdUsers = await User.insertMany(usersWithRoleIds);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Display created users
    console.log("\n📊 Seeded Users:");
    console.log("=".repeat(80));
    for (const user of createdUsers) {
      const role = createdRoles.find((r) => r._id.equals(user.role));
      console.log(`
Email: ${user.email}
Password: ${users.find((u) => u.email === user.email).password}
Role: ${role.displayName} (${role.name})
Verified: ${user.isVerified ? "Yes" : "No"}
Active: ${user.isActive ? "Yes" : "No"}
${"-".repeat(80)}`);
    }

    console.log("\n🎉 Database seeding completed successfully!");
    console.log("\n💡 You can now use these credentials to login:");
    console.log("   Admin: admin@learnoverse.com / Admin@123456");
    console.log(
      "   Instructor: john.instructor@learnoverse.com / Instructor@123"
    );
    console.log("   Student: alice.student@learnoverse.com / Student@123");
    console.log("   Moderator: mike.moderator@learnoverse.com / Moderator@123");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
