const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../src/models/User');

async function provisionAdmin() {
  const args = process.argv.slice(2);
  const email = (args[0] || 'admin@foodapp.com').toLowerCase().trim();
  const password = args[1] || 'admin123';
  const name = args[2] || 'System Administrator';

  console.log('====================================================');
  console.log('       FEASTDASH SERVER ADMIN PROVISIONING          ');
  console.log('====================================================\n');

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_delivery';

  try {
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to Primary MongoDB');
    } catch (err) {
      console.log('Connecting to embedded in-memory MongoDB fallback...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
    }

    let user = await User.findOne({ email });

    if (user) {
      user.role = 'admin';
      user.password = password; // Will be hashed by pre-save hook
      if (name) user.name = name;
      await user.save();
      console.log(`[PROVISION SUCCESS] Existing user '${email}' was promoted to role: 'admin'.`);
    } else {
      user = await User.create({
        name,
        email,
        password,
        role: 'admin',
        phone: '+1 (555) 019-9898',
        address: {
          street: '100 Culinary Blvd',
          city: 'Foodville',
          state: 'CA',
          zipCode: '90210'
        }
      });
      console.log(`[PROVISION SUCCESS] New administrator created: '${email}' with role: 'admin'.`);
    }

    console.log(`\nAdmin Credentials:\n  Email:    ${email}\n  Password: ${password}\n  Role:     admin\n`);
    process.exit(0);
  } catch (error) {
    console.error('[PROVISION ERROR]', error.message);
    process.exit(1);
  }
}

provisionAdmin();
