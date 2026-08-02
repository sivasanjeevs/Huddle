const prisma = require('../lib/prisma');
const aiService = require('../services/aiService');
const jwt = require('jsonwebtoken');

let ioInstance;

function registerSocketHandlers(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log(`[Socket] User connected: ${socket.id}`);

    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(`user_${decoded.userId}`);
        console.log(`[Socket] User ${socket.id} authenticated and joined user_${decoded.userId}`);
      } catch (err) {
        console.error('[Socket] Invalid token for user connection');
      }
    }

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
              // --- Fetch Context ---
              // Heavy DB querying removed to optimize AI context usage.
              // We now just pass the lobbyId and the AI engine uses tools to fetch it on demand.
              // ---------------------

              if (query.toLowerCase().includes("turf") || query.toLowerCase().includes("turfs")) {
                const turfs = await aiService.findTurfs(query, lobbyId);
                if (turfs && turfs.length > 0) {
                   aiResponse = "Here are some turfs I found:\n\n" + turfs.map(t => `**${t.name}**\n📍 ${t.address || 'Address not available'}\n📞 ${t.contact || 'Contact not available'}`).join('\n\n');
                } else {
                   aiResponse = "I couldn't find any specific turfs for that location.";
                }
              } else {
                 const generalResponse = await aiService.answerEventQuestions(query, lobbyId);
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
}

const getIo = () => ioInstance;

module.exports = { registerSocketHandlers, getIo };
