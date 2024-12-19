const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const Recipe = sequelize.define('Recipe', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  ingredients: {
    type: DataTypes.JSON, // Example: [{name: 'sugar', amount: '1 cup'}]
    allowNull: false,
  },
  steps: {
    type: DataTypes.JSON, // Example: ['Step 1', 'Step 2']
    allowNull: false,
  },
});

// Relationship
Recipe.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Recipe, { foreignKey: 'userId' });

module.exports = Recipe;
