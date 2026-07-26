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

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/lobbies', lobbyRoutes);
app.use('/api/ai', aiRoutes);

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

  // Lobby chat handlers
  socket.on('join_lobby', (lobbyId) => {
    socket.join(lobbyId);
    console.log(`[Socket] User ${socket.id} joined lobby ${lobbyId}`);
  });

  socket.on('send_message', async (data) => {
    const { lobbyId, userId, content } = data;
    try {
      const prisma = require('./lib/prisma');
      const message = await prisma.lobbyMessage.create({
        data: {
          lobbyId,
          userId,
          content
        },
        include: {
          user: { select: { id: true, name: true, avatar: true } }
        }
      });
      io.to(lobbyId).emit('receive_message', message);

      // --- AI Integration ---
      if (content.trim().toLowerCase().startsWith('@huddle')) {
        const query = content.trim().substring(7).trim(); // remove @huddle
        const aiService = require('./services/aiService');
        
        try {
          const aiEmail = 'ai@huddle.com';
          let aiUser = await prisma.user.findUnique({ where: { email: aiEmail } });
          
          if (!aiUser) {
             aiUser = await prisma.user.create({
                data: {
                  email: aiEmail,
                  name: 'Huddle AI',
                  password: 'ai_dummy_password',
                  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=huddle-ai'
                }
             });
          }

          let aiResponse = "";
          try {
            if (query.toLowerCase().includes("turf") || query.toLowerCase().includes("turfs")) {
              const turfs = await aiService.findTurfs(query);
              if (turfs && turfs.length > 0) {
                 aiResponse = "Here are some turfs I found:\n\n" + turfs.map(t => `**${t.name}**\n📍 ${t.address || 'Address not available'}\n📞 ${t.contact || 'Contact not available'}`).join('\n\n');
              } else {
                 aiResponse = "I couldn't find any specific turfs for that location.";
              }
            } else {
               const generalResponse = await aiService.answerEventQuestions(query);
               aiResponse = generalResponse.answer;
            }
          } catch (aiError) {
            console.error('[Socket] AI Error:', aiError);
            aiResponse = "Sorry, I am currently experiencing high demand or an error occurred. Please try again in a few moments.";
          }

          const aiMessage = await prisma.lobbyMessage.create({
            data: {
              lobbyId,
              userId: aiUser.id,
              content: aiResponse
            },
            include: {
              user: { select: { id: true, name: true, avatar: true } }
            }
          });
          
          io.to(lobbyId).emit('receive_message', aiMessage);
          
        } catch (setupError) {
          console.error('[Socket] AI Setup Error:', setupError);
        }
      }
    } catch (error) {
      console.error('[Socket] Error saving/sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Real-time core listening on port ${PORT}`);
});
