require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json()); // Essential for parsing application/json

// Ensure uploads directory exists and serve it as static
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use('/uploads', express.static(uploadDir));

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const lobbyRoutes = require('./routes/lobby.routes');
const aiRoutes = require('./routes/aiRoutes');
const notificationRoutes = require('./routes/notification.routes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lobbies', lobbyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);

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

const { registerSocketHandlers } = require('./socket/handlers');
registerSocketHandlers(io);

const { startNotificationScheduler } = require('./services/notificationService');
startNotificationScheduler();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Real-time core listening on port ${PORT}`);
});
