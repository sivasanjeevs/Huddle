require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Essential for parsing application/json

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST']
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'huddle-chat-server' });
});

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  // Ping/Pong handler
  socket.on('ping', () => {
    console.log(`[Socket] Received ping from ${socket.id}`);
    socket.emit('pong', { message: 'pong', timestamp: Date.now() });
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Real-time core listening on port ${PORT}`);
});
