const prisma = require('../lib/prisma');
const aiService = require('../services/aiService');

function registerSocketHandlers(io) {
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
              const lobbyDetails = await prisma.lobby.findUnique({
                where: { id: lobbyId },
                select: { title: true, description: true, category: true, date: true, time: true, location: true }
              });

              const recentMessages = await prisma.lobbyMessage.findMany({
                where: { lobbyId },
                orderBy: { createdAt: 'desc' },
                take: 15,
                include: { user: { select: { name: true } } }
              });
              recentMessages.reverse();

              const context = {
                eventDetails: lobbyDetails,
                chatHistory: recentMessages.map(m => `${m.user.name}: ${m.content}`)
              };
              // ---------------------

              if (query.toLowerCase().includes("turf") || query.toLowerCase().includes("turfs")) {
                const turfs = await aiService.findTurfs(query, context);
                if (turfs && turfs.length > 0) {
                   aiResponse = "Here are some turfs I found:\n\n" + turfs.map(t => `**${t.name}**\n📍 ${t.address || 'Address not available'}\n📞 ${t.contact || 'Contact not available'}`).join('\n\n');
                } else {
                   aiResponse = "I couldn't find any specific turfs for that location.";
                }
              } else {
                 const generalResponse = await aiService.answerEventQuestions(query, context);
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

module.exports = { registerSocketHandlers };
