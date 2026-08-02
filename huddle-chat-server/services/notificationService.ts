const prisma = require('../lib/prisma');
const { getIo } = require('../socket/handlers');

const startNotificationScheduler = () => {
  console.log('Notification scheduler started');
  // Run every minute
  setInterval(async () => {
    try {
      const now = new Date();
      // We want to find lobbies that start in exactly 1 hour from now
      // Let's get the target time (now + 1 hour)
      const targetTime = new Date(now.getTime() + 60 * 60 * 1000);
      
      const targetDateString = targetTime.toISOString().split('T')[0];
      const targetTimeString = targetTime.toTimeString().substring(0, 5); // "HH:MM"

      // We need to query lobbies that match the date and time string
      // But since we store date and time as strings, we can check lobbies where
      // the date is today or tomorrow, and calculate time difference.
      
      // A more robust way: fetch active, unreminded lobbies that have a date >= today
      const lobbies = await prisma.lobby.findMany({
        where: {
          active: true,
          reminderSent: false,
          date: { gte: now.toISOString().split('T')[0] }
        },
        include: {
          participants: { select: { userId: true } },
          creator: { select: { name: true } }
        }
      });

      for (const lobby of lobbies) {
        if (!lobby.date || !lobby.time) continue;
        
        const lobbyDateTime = new Date(`${lobby.date}T${lobby.time}:00`);
        const diffMinutes = (lobbyDateTime.getTime() - now.getTime()) / (1000 * 60);

        // If the event is starting in <= 60 minutes and > 0 minutes
        if (diffMinutes <= 60 && diffMinutes > 0) {
          // Mark as reminded
          await prisma.lobby.update({
            where: { id: lobby.id },
            data: { reminderSent: true }
          });

          // Create notifications for all participants
          const notificationData = lobby.participants.map(p => ({
            userId: p.userId,
            message: `Reminder: Event "${lobby.title}" is starting in less than an hour!`,
            type: 'reminder'
          }));

          if (notificationData.length > 0) {
            await prisma.notification.createMany({ data: notificationData });
            
            // Emit via socket
            const io = getIo();
            if (io) {
              for (const p of lobby.participants) {
                // Since socket rooms can be user ids, we emit to user room
                io.to(`user_${p.userId}`).emit('new_notification', {
                  message: `Reminder: Event "${lobby.title}" is starting in less than an hour!`,
                  type: 'reminder',
                  createdAt: new Date()
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Notification scheduler error:', error);
    }
  }, 60 * 1000); // 1 minute
};

module.exports = { startNotificationScheduler };
