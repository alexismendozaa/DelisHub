const express = require('express');
const { createRecipe, getRecipes } = require('../controllers/recipeController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createRecipe);
router.get('/', getRecipes);

module.exports = router;
