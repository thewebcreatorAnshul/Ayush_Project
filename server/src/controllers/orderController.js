const Order = require('../models/Order');
const foodApiService = require('../services/foodApiService');

const generateOrderId = () => {
  const randomNum = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${randomNum}`;
};

// @desc    Create new order for authenticated customer
// @route   POST /api/orders
// @access  Private (Customer / User)
const createOrder = async (req, res, next) => {
  try {
    const { items, deliveryAddress, paymentMethod = 'Card', deliveryFee = 3.99 } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one food item',
        errors: ['Empty order items']
      });
    }

    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const foodIdStr = String(item.food || item.id || item._id);
      const foodItem = await foodApiService.getFoodById(foodIdStr);

      if (!foodItem) {
        return res.status(404).json({
          success: false,
          message: `Food item not found with ID ${foodIdStr}`,
          errors: [`Item ${foodIdStr} does not exist in food menu`]
        });
      }

      if (!foodItem.availability) {
        return res.status(400).json({
          success: false,
          message: `Item '${foodItem.name}' is currently out of stock`,
          errors: [`${foodItem.name} unavailable`]
        });
      }

      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      subtotal += foodItem.price * qty;

      validatedItems.push({
        food: foodIdStr,
        name: foodItem.name,
        price: foodItem.price,
        image: foodItem.image,
        quantity: qty
      });
    }

    const tax = parseFloat((subtotal * 0.08).toFixed(2));
    const parsedFee = parseFloat(deliveryFee) || 3.99;
    const total = parseFloat((subtotal + tax + parsedFee).toFixed(2));

    const now = new Date();
    const estimatedDelivery = new Date(now.getTime() + 35 * 60 * 1000);
    const orderId = generateOrderId();

    const order = await Order.create({
      orderId,
      user: req.user._id,
      items: validatedItems,
      subtotal: parseFloat(subtotal.toFixed(2)),
      tax,
      deliveryFee: parsedFee,
      total,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Completed',
      status: 'PLACED',
      estimatedDelivery,
      statusHistory: [
        {
          status: 'PLACED',
          timestamp: now,
          note: 'Order received and sent to kitchen'
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current customer's order history
// @route   GET /api/orders or GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID or order tracking number
// @route   GET /api/orders/:id
// @access  Private (Enforces IDOR ownership check)
const getOrderById = async (req, res, next) => {
  try {
    const identifier = req.params.id;

    let order;
    if (identifier.startsWith('ORD-')) {
      order = await Order.findOne({ orderId: identifier }).populate('user', 'name email phone').lean();
    } else if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(identifier).populate('user', 'name email phone').lean();
    } else {
      order = await Order.findOne({ orderId: identifier }).populate('user', 'name email phone').lean();
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order not found with identifier '${identifier}'`,
        errors: [`Order '${identifier}' does not exist`]
      });
    }

    // IDOR Security Protection: Customer can only access their own orders; Admin can access any order
    if (req.user && req.user.role !== 'admin' && order.user) {
      const orderOwnerId = order.user._id ? order.user._id.toString() : order.user.toString();
      if (orderOwnerId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You do not have permission to inspect another customer’s order.',
          errors: ['Forbidden: IDOR protection blocked access']
        });
      }
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById
};
