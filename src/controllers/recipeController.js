const Recipe = require('../models/Recipe');

const createRecipe = async (req, res) => {
  const { title, description, ingredients, steps } = req.body;
  try {
    const recipe = await Recipe.create({
      title,
      description,
      ingredients,
      steps,
      userId: req.user.id,
    });
    res.status(201).json({ message: 'Recipe created successfully', recipe });
  } catch (error) {
    res.status(400).json({ error: 'Error creating recipe', details: error });
  }
};

const getRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.findAll();
    res.json(recipes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching recipes', details: error });
  }
};

module.exports = { createRecipe, getRecipes };
