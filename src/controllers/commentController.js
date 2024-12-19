const Comment = require('../models/Comment');
const { io } = require('../server');

const createComment = async (req, res) => {
    const { recipeId, content } = req.body;
    try {
      const comment = await Comment.create({
        content,
        recipeId,
        userId: req.user.id,
      });
  
      // Notify the recipe owner
      const recipe = await Recipe.findByPk(recipeId);
      if (recipe) {
        const ownerSocketId = activeUsers[recipe.userId]; // Assuming a map of active users
        if (ownerSocketId) {
          io.to(ownerSocketId).emit('new-comment', {
            message: `New comment on your recipe: ${recipe.title}`,
            comment,
          });
        }
      }
  
      res.status(201).json({ message: 'Comment added successfully', comment });
    } catch (error) {
      res.status(400).json({ error: 'Error adding comment', details: error });
    }
  };
  

const getCommentsByRecipe = async (req, res) => {
  const { recipeId } = req.params;
  try {
    const comments = await Comment.findAll({ where: { recipeId } });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching comments', details: error });
  }
};

module.exports = { createComment, getCommentsByRecipe };
