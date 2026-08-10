require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createAdmin() {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('Connected to DB');

    const email = 'admin@gmail.com';
    const password = '123456';

    let user = await User.findOne({ email });
    if (user) {
      console.log('User already exists, updating role and password...');
    } else {
      user = new User({ email, name: 'Admin User', role: 'admin' });
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
