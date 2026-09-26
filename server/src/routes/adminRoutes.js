const express = require('express');
const router = express.Router();
const { authenticateUser, requireAdmin } = require('../middleware/auth');
const {
  adminLogin,
  adminLogout,
  adminGetMe
} = require('../controllers/adminAuthController');
const {
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
} = require('../controllers/adminController');

// 1. Admin Dedicated Authentication Routes
router.post('/auth/login', adminLogin);
router.post('/auth/logout', adminLogout);
router.get('/auth/me', authenticateUser, requireAdmin, adminGetMe);

// 2. Dashboard Analytics (Protected: requireAdmin)
router.get('/dashboard', authenticateUser, requireAdmin, getDashboardStats);

// 3. Products Management (Protected: requireAdmin)
router.get('/products', authenticateUser, requireAdmin, getAdminProducts);
router.post('/products', authenticateUser, requireAdmin, createAdminProduct);
router.put('/products/:id', authenticateUser, requireAdmin, updateAdminProduct);
router.delete('/products/:id', authenticateUser, requireAdmin, deleteAdminProduct);

// 4. Categories Management (Protected: requireAdmin)
router.get('/categories', authenticateUser, requireAdmin, getAdminCategories);
router.post('/categories', authenticateUser, requireAdmin, createAdminCategory);
router.put('/categories/:id', authenticateUser, requireAdmin, updateAdminCategory);
router.delete('/categories/:id', authenticateUser, requireAdmin, deleteAdminCategory);

// 5. Orders Management (Protected: requireAdmin)
router.get('/orders', authenticateUser, requireAdmin, getAdminOrders);
router.get('/orders/:id', authenticateUser, requireAdmin, getAdminOrderById);
router.patch('/orders/:id/status', authenticateUser, requireAdmin, updateAdminOrderStatus);

// 6. Users Management (Protected: requireAdmin)
router.get('/users', authenticateUser, requireAdmin, getAdminUsers);
router.get('/users/:id', authenticateUser, requireAdmin, getAdminUserById);
router.patch('/users/:id', authenticateUser, requireAdmin, updateAdminUser);
router.delete('/users/:id', authenticateUser, requireAdmin, deleteAdminUser);

// 7. Store Settings (Protected: requireAdmin)
router.get('/settings', authenticateUser, requireAdmin, getAdminSettings);
router.put('/settings', authenticateUser, requireAdmin, updateAdminSettings);

module.exports = router;
