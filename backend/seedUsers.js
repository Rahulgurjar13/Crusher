const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const { connectDB } = require('./config');

dotenv.config();

const users = [
  {
    email: 'admin@example.com',
    password: 'Admin123!',
    role: 'admin',
  },
  {
    email: 'partner1@example.com',
    password: 'Partner123!',
    role: 'partner',
  },
  {
    email: 'operator1@example.com',
    password: 'Operator123!',
    role: 'operator',
  },
];

const seedUsers = async () => {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing users (optional, comment out to keep existing data)
    await User.deleteMany({});

    // Insert users with plain-text passwords
    for (const user of users) {
      await User.create({
        email: user.email,
        password: user.password, // Stored in plain text
        role: user.role,
      });
      console.log(`Inserted user: ${user.email}`);
    }

    console.log('Users seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding users:', err);
    process.exit(1);
  }
};

seedUsers();