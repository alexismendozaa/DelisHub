const express = require('express');
const { createComment, getCommentsByRecipe } = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createComment);
router.get('/:recipeId', getCommentsByRecipe);

module.exports = router;

const { body } = require('express-validator');

router.post(
  '/',
  authMiddleware,
  body('content').notEmpty().withMessage('Content is required'),
  body('recipeId').notEmpty().withMessage('Recipe ID is required'),
  createComment
);
