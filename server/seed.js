const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Food = require('./src/models/Food');
const Order = require('./src/models/Order');

const foodsData = [
  {
    name: 'Truffle Smash Cheeseburger',
    description: 'Double Angus beef patties, aged cheddar, black truffle aioli, caramelised onions, brioche bun.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
    category: 'Burgers',
    rating: 4.9,
    numReviews: 128,
    prepTime: '15-20 min',
    isPopular: true,
    calories: 780,
    dietary: ['Halal Beef']
  },
  {
    name: 'Margherita Burrata Pizza',
    description: 'San Marzano tomato base, fresh creamy burrata ball, basil oil, extra virgin olive oil, woodfired crust.',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    rating: 4.8,
    numReviews: 95,
    prepTime: '20-25 min',
    isPopular: true,
    calories: 890,
    dietary: ['Vegetarian']
  },
  {
    name: 'Pepperoni & Honey Blast Pizza',
    description: 'Crispy spicy pepperoni, mozzarella, crushed red pepper flakes, drizzled with spicy honey.',
    price: 17.99,
    image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80',
    category: 'Pizza',
    rating: 4.7,
    numReviews: 84,
    prepTime: '20-25 min',
    isPopular: false,
    calories: 950,
    dietary: []
  },
  {
    name: 'Crispy Korean Fried Chicken Burger',
    description: 'Gochujang glazed chicken breast, kimchi slaw, pickled cucumbers, kewpie mayo on sesame brioche.',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?auto=format&fit=crop&w=800&q=80',
    category: 'Burgers',
    rating: 4.9,
    numReviews: 156,
    prepTime: '15-20 min',
    isPopular: true,
    calories: 720,
    dietary: ['Spicy']
  },
  {
    name: 'Tonkotsu Pork Ramen',
    description: 'Rich pork bone broth, thin straight noodles, tender chashu pork belly, ajitsuke tamago egg, bamboo shoots.',
    price: 15.50,
    image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=800&q=80',
    category: 'Asian',
    rating: 4.8,
    numReviews: 110,
    prepTime: '20-30 min',
    isPopular: true,
    calories: 680,
    dietary: []
  },
  {
    name: 'Thai Green Curry Bowl',
    description: 'Aromatic green curry broth, coconut milk, lemongrass, fresh jasmine rice, bamboo shoots & tofu.',
    price: 13.50,
    image: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&w=800&q=80',
    category: 'Asian',
    rating: 4.6,
    numReviews: 62,
    prepTime: '15-25 min',
    isPopular: false,
    calories: 550,
    dietary: ['Vegan', 'Gluten-Free']
  },
  {
    name: 'Classic Creamy Carbonara',
    description: 'Al dente spaghetti, crispy guanciale, egg yolk emulsion, Pecorino Romano, black pepper.',
    price: 14.25,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80',
    category: 'Pasta',
    rating: 4.7,
    numReviews: 73,
    prepTime: '15-20 min',
    isPopular: false,
    calories: 820,
    dietary: []
  },
  {
    name: 'Avocado Caesar Power Salad',
    description: 'Crisp romaine lettuce, Hass avocado, shaved parmesan, garlic croutons, house creamy caesar dressing.',
    price: 11.99,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    category: 'Salads',
    rating: 4.5,
    numReviews: 48,
    prepTime: '10-15 min',
    isPopular: false,
    calories: 340,
    dietary: ['Vegetarian', 'Healthy']
  },
  {
    name: 'Belgian Molten Chocolate Lava Cake',
    description: 'Warm dark chocolate cake with a molten center, served with Madagascan vanilla bean ice cream.',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80',
    category: 'Desserts',
    rating: 4.9,
    numReviews: 210,
    prepTime: '10-15 min',
    isPopular: true,
    calories: 580,
    dietary: ['Vegetarian']
  },
  {
    name: 'Iced Caramel Macchiato',
    description: 'Freshly pulled espresso, velvety vanilla syrup, cold milk, layered with sweet caramel drizzle.',
    price: 5.50,
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80',
    category: 'Beverages',
    rating: 4.7,
    numReviews: 142,
    prepTime: '5-10 min',
    isPopular: false,
    calories: 220,
    dietary: ['Vegetarian']
  },
  {
    name: 'Fresh Mango Passionfruit Smoothie',
    description: 'Blended Alphonso mangoes, passionfruit pulp, Greek yoghurt, splash of fresh orange juice.',
    price: 6.25,
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=800&q=80',
    category: 'Beverages',
    rating: 4.8,
    numReviews: 89,
    prepTime: '5-10 min',
    isPopular: false,
    calories: 190,
    dietary: ['Vegetarian', 'Gluten-Free']
  },
  {
    name: 'Classic New York Cheesecake',
    description: 'Rich, smooth cream cheese cake on a graham cracker crust, topped with fresh strawberry coulis.',
    price: 7.99,
    image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80',
    category: 'Desserts',
    rating: 4.8,
    numReviews: 167,
    prepTime: '5-10 min',
    isPopular: false,
    calories: 490,
    dietary: ['Vegetarian']
  }
];

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/food_delivery';
    
    try {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
      console.log('Connected to MongoDB for Seeding');
    } catch (err) {
      console.log('Local MongoDB not running. Launching in-memory server for seeding...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      await mongoose.connect(mongod.getUri());
      console.log('Connected to In-Memory MongoDB for Seeding');
    }

    // Clear existing data
    await User.deleteMany({});
    await Food.deleteMany({});
    await Order.deleteMany({});

    console.log('Cleared existing collections...');

    // Seed Users
    const adminUser = await User.create({
      name: 'Admin Chef',
      email: 'admin@foodapp.com',
      password: 'admin123',
      role: 'admin',
      phone: '+1 555-0199',
      address: {
        street: '100 Culinary Blvd',
        city: 'Foodville',
        state: 'CA',
        zipCode: '90210'
      }
    });

    const demoUser = await User.create({
      name: 'Alex Johnson',
      email: 'demo@foodapp.com',
      password: 'user123',
      role: 'customer',
      phone: '+1 555-0144',
      address: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zipCode: '97477'
      }
    });

    await User.create({
      name: 'Customer User',
      email: 'customer@foodapp.com',
      password: 'user123',
      role: 'customer',
      phone: '+1 555-0155',
      address: {
        street: '123 Customer Way',
        city: 'Springfield',
        state: 'OR',
        zipCode: '97477'
      }
    });

    console.log('Seeded Users (admin@foodapp.com [admin], customer@foodapp.com [customer], demo@foodapp.com [customer])');

    // Seed Foods
    const createdFoods = await Food.insertMany(foodsData);
    console.log(`Seeded ${createdFoods.length} Food items`);

    // Seed Demo Order
    const subtotal = createdFoods[0].price + createdFoods[4].price;
    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const deliveryFee = 3.99;
    const total = parseFloat((subtotal + tax + deliveryFee).toFixed(2));

    const now = new Date();
    const demoOrder = await Order.create({
      orderId: 'ORD-89241',
      user: demoUser._id,
      items: [
        {
          food: createdFoods[0]._id,
          name: createdFoods[0].name,
          price: createdFoods[0].price,
          image: createdFoods[0].image,
          quantity: 1
        },
        {
          food: createdFoods[4]._id,
          name: createdFoods[4].name,
          price: createdFoods[4].price,
          image: createdFoods[4].image,
          quantity: 1
        }
      ],
      subtotal,
      tax,
      deliveryFee,
      total,
      deliveryAddress: {
        street: '742 Evergreen Terrace',
        city: 'Springfield',
        state: 'OR',
        zipCode: '97477',
        phone: '+1 555-0144',
        instructions: 'Please ring bell twice.'
      },
      paymentMethod: 'Card',
      paymentStatus: 'Completed',
      status: 'CONFIRMED',
      estimatedDelivery: new Date(now.getTime() + 30 * 60 * 1000),
      statusHistory: [
        {
          status: 'PLACED',
          timestamp: new Date(now.getTime() - 10 * 60 * 1000),
          note: 'Order received by system'
        },
        {
          status: 'CONFIRMED',
          timestamp: new Date(now.getTime() - 5 * 60 * 1000),
          note: 'Kitchen confirmed your order'
        }
      ]
    });

    console.log(`Seeded Demo Order with ID: ${demoOrder.orderId}`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
