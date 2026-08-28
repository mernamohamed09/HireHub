const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  try {
    if (!process.env.DB_URL) {
      console.error('[Security Error] DB_URL environment variable is missing.');
      process.exit(1);
    }
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to DB');

    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      console.error('[Security Error] ADMIN_EMAIL and ADMIN_PASSWORD environment variables are strictly required to seed an admin account.');
      process.exit(1);
    }

    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists, updating role and password...');
    } else {
      user = new User({ email, name: process.env.ADMIN_NAME || 'Admin User', role: 'admin' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.role = 'admin';
    await user.save();

    console.log(`Admin user ${email} successfully created/updated!`);
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from DB');
    process.exit(0);
  }
}

createAdmin();
