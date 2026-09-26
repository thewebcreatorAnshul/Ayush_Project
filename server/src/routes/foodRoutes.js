const express = require('express');
const router = express.Router();
const {
  getFoods,
  getCategories,
  getCuisines,
  getFoodById
} = require('../controllers/foodController');

router.get('/', getFoods);
router.get('/categories', getCategories);
router.get('/cuisines', getCuisines);
router.get('/:id', getFoodById);

module.exports = router;
