const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const app = require('./app');
const connectDB = require('./config/db');
const User = require('./models/User');
const Order = require('./models/Order');
const { fetchExternalFoods } = require('./services/foodApiService');

const PORT = process.env.PORT || 5000;

const autoSeedIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database empty. Auto-seeding initial Customer and Admin accounts...');
      
      const demoUser = await User.create({
        name: 'Alex Johnson',
        email: 'demo@foodapp.com',
        password: 'user123',
        role: 'customer',
        phone: '+1 555-0144',
        address: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'OR', zipCode: '97477' }
      });

      await User.create({
        name: 'Customer Demo',
        email: 'customer@foodapp.com',
        password: 'user123',
        role: 'customer',
        phone: '+1 555-0155',
        address: { street: '123 Customer Way', city: 'Springfield', state: 'OR', zipCode: '97477' }
      });

      await User.create({
        name: 'Master Administrator',
        email: 'admin@foodapp.com',
        password: 'admin123',
        role: 'admin',
        phone: '+1 555-0199',
        address: { street: '100 Culinary Blvd', city: 'Foodville', state: 'CA', zipCode: '90210' }
      });

      const foods = await fetchExternalFoods();
      const firstFood = foods[0] || { id: "1", name: "Classic Margherita Pizza", price: 14.99, image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3" };
      const secondFood = foods[1] || { id: "2", name: "Truffle Smash Cheeseburger", price: 15.50, image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd" };

      const now = new Date();
      await Order.create({
        orderId: 'ORD-89241',
        user: demoUser._id,
        items: [
          { food: String(firstFood.id || firstFood._id), name: firstFood.name, price: firstFood.price, image: firstFood.image, quantity: 1 },
          { food: String(secondFood.id || secondFood._id), name: secondFood.name, price: secondFood.price, image: secondFood.image, quantity: 1 }
        ],
        subtotal: parseFloat((firstFood.price + secondFood.price).toFixed(2)),
        tax: parseFloat(((firstFood.price + secondFood.price) * 0.08).toFixed(2)),
        deliveryFee: 3.99,
        total: parseFloat(((firstFood.price + secondFood.price) * 1.08 + 3.99).toFixed(2)),
        deliveryAddress: { street: '742 Evergreen Terrace', city: 'Springfield', state: 'OR', zipCode: '97477', phone: '+1 555-0144' },
        paymentMethod: 'Card',
        paymentStatus: 'Completed',
        status: 'CONFIRMED',
        estimatedDelivery: new Date(now.getTime() + 30 * 60 * 1000),
        statusHistory: [
          { status: 'PLACED', timestamp: new Date(now.getTime() - 10 * 60 * 1000), note: 'Order placed' },
          { status: 'CONFIRMED', timestamp: new Date(now.getTime() - 5 * 60 * 1000), note: 'Kitchen confirmed order' }
        ]
      });

      console.log('Auto-seeding complete! Customer (customer@foodapp.com) and Admin (admin@foodapp.com) ready.');
    }
  } catch (err) {
    console.error('Auto seed error:', err.message);
  }
};

// Connect to MongoDB and start Express server
connectDB().then(async () => {
  await autoSeedIfEmpty();
  app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`Customer & Admin Backend Gateway: http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
});
