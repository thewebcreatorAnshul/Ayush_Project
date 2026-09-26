const User = require('../models/User');
const Order = require('../models/Order');
const Food = require('../models/Food');
const foodApiService = require('../services/foodApiService');

const STATUS_SEQUENCE = ['PLACED', 'CONFIRMED', 'PREPARING', 'PICKED UP', 'DELIVERED'];

// In-memory store for custom admin categories
let adminCustomCategories = ['Burgers', 'Pizza', 'Asian', 'Pasta', 'Salads', 'Desserts', 'Beverages'];

// In-memory store for store settings
let adminStoreSettings = {
  restaurantName: 'FeastDash Gourmet Kitchen',
  contactEmail: 'support@feastdash.com',
  contactPhone: '+1 (555) 987-6543',
  address: '742 Evergreen Terrace, Springfield, OR',
  taxRate: 8,
  deliveryFee: 3.99,
  freeDeliveryThreshold: 40.00,
  estimatedPrepTime: '20-30 min',
  isAcceptingOrders: true
};

// ==========================================
// 1. DASHBOARD OVERVIEW
// ==========================================
const getDashboardStats = async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments({ role: { $in: ['customer', 'user'] } });
    
    // Revenue calculation
    const revenueAggregate = await Order.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
    ]);
    const totalRevenue = revenueAggregate[0]?.totalRevenue ? parseFloat(revenueAggregate[0].totalRevenue.toFixed(2)) : 0;

    // Status distribution
    const statusCounts = {
      PLACED: await Order.countDocuments({ status: 'PLACED' }),
      CONFIRMED: await Order.countDocuments({ status: 'CONFIRMED' }),
      PREPARING: await Order.countDocuments({ status: 'PREPARING' }),
      PICKED_UP: await Order.countDocuments({ status: 'PICKED UP' }),
      DELIVERED: await Order.countDocuments({ status: 'DELIVERED' })
    };

    const pendingOrders = statusCounts.PLACED + statusCounts.CONFIRMED + statusCounts.PREPARING + statusCounts.PICKED_UP;
    const deliveredOrders = statusCounts.DELIVERED;

    // Catalog stats
    const catalogResult = await foodApiService.getFoods({ limit: 1 });
    const totalProducts = catalogResult.total || 0;

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Recent 5 users
    const recentUsers = await User.find({ role: { $in: ['customer', 'user'] } })
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue,
        totalUsers,
        totalProducts,
        pendingOrders,
        deliveredOrders,
        statusCounts,
        recentOrders,
        recentUsers,
        categoryCounts: catalogResult.categoryCounts || {}
      }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 2. PRODUCTS MANAGEMENT (CRUD)
// ==========================================
const getAdminProducts = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 20 } = req.query;
    const result = await foodApiService.getFoods({ search, category, page, limit });

    res.json({
      success: true,
      count: result.count,
      total: result.total,
      page: result.page,
      pages: result.pages,
      data: result.foods
    });
  } catch (error) {
    next(error);
  }
};

const createAdminProduct = async (req, res, next) => {
  try {
    const { name, description, price, image, category, cuisine, ingredients, prepTime, calories, dietary, availability = true } = req.body;

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        message: 'Name, description, price, and category are required',
        errors: ['Missing required fields']
      });
    }

    const newProduct = await Food.create({
      name,
      description,
      price: parseFloat(price),
      image: image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80',
      category,
      cuisine: cuisine || 'Continental',
      rating: 4.8,
      numReviews: 1,
      prepTime: prepTime || '20 min',
      calories: parseInt(calories, 10) || 450,
      dietary: Array.isArray(dietary) ? dietary : (dietary ? [dietary] : []),
      availability
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = await Food.findById(id);

    if (!product) {
      // If product originated from external API dataset, we create an override document
      const catalogProduct = await foodApiService.getFoodById(id);
      if (!catalogProduct) {
        return res.status(404).json({
          success: false,
          message: `Product with ID '${id}' not found`,
          errors: ['Product not found']
        });
      }

      product = new Food({
        _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : undefined,
        name: catalogProduct.name,
        description: catalogProduct.description,
        price: catalogProduct.price,
        image: catalogProduct.image,
        category: catalogProduct.category,
        cuisine: catalogProduct.cuisine
      });
    }

    Object.assign(product, req.body);
    const updated = await product.save();

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Food.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 3. CATEGORIES MANAGEMENT (CRUD)
// ==========================================
const getAdminCategories = async (req, res, next) => {
  try {
    const categoriesWithCounts = await foodApiService.getCategories();
    res.json({
      success: true,
      data: categoriesWithCounts
    });
  } catch (error) {
    next(error);
  }
};

const createAdminCategory = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
        errors: ['Missing category name']
      });
    }

    const trimmed = name.trim();
    if (!adminCustomCategories.includes(trimmed)) {
      adminCustomCategories.push(trimmed);
    }

    res.status(201).json({
      success: true,
      message: `Category '${trimmed}' created successfully`,
      data: { name: trimmed }
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminCategory = async (req, res, next) => {
  try {
    const { id } = req.params; // old name or index
    const { newName } = req.body;

    if (!newName || !newName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'New category name is required',
        errors: ['Missing new category name']
      });
    }

    res.json({
      success: true,
      message: `Category updated to '${newName.trim()}'`,
      data: { name: newName.trim() }
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminCategory = async (req, res, next) => {
  try {
    const { id } = req.params; // category name
    adminCustomCategories = adminCustomCategories.filter(c => c.toLowerCase() !== id.toLowerCase());

    res.json({
      success: true,
      message: `Category '${id}' deleted successfully`,
      data: { name: id }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 4. ORDERS MANAGEMENT
// ==========================================
const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status && status !== 'All') {
      filter.status = status;
    }

    if (search && search.trim()) {
      filter.$or = [
        { orderId: { $regex: search.trim(), $options: 'i' } },
        { 'deliveryAddress.phone': { $regex: search.trim(), $options: 'i' } },
        { 'deliveryAddress.city': { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const total = await Order.countDocuments(filter);

    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    res.json({
      success: true,
      count: orders.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

const getAdminOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }]
    }).populate('user', 'name email phone').lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        errors: ['Order does not exist']
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!STATUS_SEQUENCE.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be one of: ${STATUS_SEQUENCE.join(', ')}`,
        errors: ['Invalid status value']
      });
    }

    const order = await Order.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderId: id }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        errors: ['Order does not exist']
      });
    }

    const currentIndex = STATUS_SEQUENCE.indexOf(order.status);
    const targetIndex = STATUS_SEQUENCE.indexOf(status);

    if (targetIndex < currentIndex) {
      return res.status(400).json({
        success: false,
        message: `Cannot revert order status backwards from '${order.status}' to '${status}'`,
        errors: ['Backward status regression is not permitted']
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Administrator updated status to ${status}`
    });

    await order.save();

    res.json({
      success: true,
      message: `Order status successfully updated to ${status}`,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 5. USERS MANAGEMENT
// ==========================================
const getAdminUsers = async (req, res, next) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role && role !== 'All') {
      filter.role = role;
    }

    if (search && search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { email: { $regex: search.trim(), $options: 'i' } },
        { phone: { $regex: search.trim(), $options: 'i' } }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 20);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum)
      .lean();

    // Attach order counts per user
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const orderCount = await Order.countDocuments({ user: u._id });
        return {
          ...u,
          orderCount
        };
      })
    );

    res.json({
      success: true,
      count: usersWithStats.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      data: usersWithStats
    });
  } catch (error) {
    next(error);
  }
};

const getAdminUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: ['User does not exist']
      });
    }

    const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).lean();

    res.json({
      success: true,
      data: {
        user,
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        errors: ['User does not exist']
      });
    }

    if (name) user.name = name;
    if (email) user.email = email.toLowerCase();
    if (phone !== undefined) user.phone = phone;
    if (role && ['customer', 'admin'].includes(role)) {
      user.role = role;
    }

    const updated = await user.save();

    res.json({
      success: true,
      message: 'User account updated successfully',
      data: {
        _id: updated._id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        phone: updated.phone
      }
    });
  } catch (error) {
    next(error);
  }
};

const deleteAdminUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own active administrator account',
        errors: ['Self deletion blocked']
      });
    }

    await User.findByIdAndDelete(id);
    res.json({
      success: true,
      message: 'User deleted successfully',
      data: { id }
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// 6. STORE SETTINGS MANAGEMENT
// ==========================================
const getAdminSettings = async (req, res) => {
  res.json({
    success: true,
    data: adminStoreSettings
  });
};

const updateAdminSettings = async (req, res) => {
  adminStoreSettings = {
    ...adminStoreSettings,
    ...req.body
  };

  res.json({
    success: true,
    message: 'Store settings updated successfully',
    data: adminStoreSettings
  });
};

module.exports = {
  getDashboardStats,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,
  getAdminUsers,
  getAdminUserById,
  updateAdminUser,
  deleteAdminUser,
  getAdminSettings,
  updateAdminSettings
};
