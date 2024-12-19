const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth');
const recipeRoutes = require('./routes/recipe');
const commentRoutes = require('./routes/comment');
const http = require('http');
const { Server } = require('socket.io');
const server = http.createServer(app);
const io = new Server(server);
const activeUsers = {}; 
const cors = require('cors');

module.exports = { app, io };
const { io } = require('../server');



dotenv.config();

const app = express();
app.use(express.json());

// Test database connection
sequelize.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Routes
app.get('/', (req, res) => res.send('Recipe Social Network API'));


app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use('/api/comments', commentRoutes);

// Socket.io logic
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    // Escucha un evento 'register' para asociar userId con socketId
    socket.on('register', (userId) => {
      console.log(`User registered: ${userId}`);
      activeUsers[userId] = socket.id;
    });
  
    // Manejo de desconexión
    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
  
      // Buscar y eliminar el userId de la lista de usuarios activos
      const userId = Object.keys(activeUsers).find(
        (key) => activeUsers[key] === socket.id
      );
      if (userId) {
        delete activeUsers[userId];
        console.log(`User ${userId} disconnected`);
      }
    });
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use(cors({
    origin: ['http://localhost:3000'], // Cambia a los dominios permitidos
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }));

  const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Recipe Social Network API',
      version: '1.0.0',
      description: 'API for managing recipes and comments',
    },
  },
  apis: ['./src/routes/*.js'], // Rutas para buscar documentación
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
