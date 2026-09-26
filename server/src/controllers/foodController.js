const foodApiService = require('../services/foodApiService');

// @desc    Get all foods with search, filter, sort & pagination via Food API Service
// @route   GET /api/foods
// @access  Public
const getFoods = async (req, res, next) => {
  try {
    const result = await foodApiService.getFoods(req.query);

    res.json({
      success: true,
      count: result.count,
      total: result.total,
      page: result.page,
      pages: result.pages,
      categoryCounts: result.categoryCounts,
      data: result.foods
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food categories with item counts
// @route   GET /api/categories or /api/foods/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const categoryList = await foodApiService.getCategories();

    res.json({
      success: true,
      data: categoryList
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available cuisines
// @route   GET /api/foods/cuisines
// @access  Public
const getCuisines = async (req, res, next) => {
  try {
    const cuisines = await foodApiService.getCuisines();

    res.json({
      success: true,
      data: cuisines
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get food by ID
// @route   GET /api/foods/:id
// @access  Public
const getFoodById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const food = await foodApiService.getFoodById(id);

    if (!food) {
      return res.status(404).json({
        success: false,
        message: `Food item not found with ID '${id}'`,
        errors: ['Resource not found']
      });
    }

    res.json({
      success: true,
      data: food
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFoods,
  getCategories,
  getCuisines,
  getFoodById
};
