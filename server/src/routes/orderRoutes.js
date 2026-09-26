const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById
} = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { validateOrder } = require('../middleware/validate');

router.post('/', protect, validateOrder, createOrder);
router.get('/', protect, getMyOrders);
router.get('/my-orders', protect, getMyOrders);
router.get('/:id', protect, getOrderById);

module.exports = router;
