const prisma = require('../lib/prisma');

exports.createLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, date, time, location, maxParticipants, visibility, tags, coverImage, categoryDetails } = req.body;

    const lobby = await prisma.lobby.create({
      data: {
        title,
        description,
        category,
        date,
        time,
        location,
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : null,
        visibility: visibility || 'Public',
        tags,
        coverImage,
        categoryDetails,
        creatorId: userId,
        // The creator also joins the lobby automatically
        participants: {
          create: {
            userId: userId
          }
        }
      },
    });

    res.status(201).json(lobby);
  } catch (error) {
    console.error('Create lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLobbies = async (req, res) => {
  try {
    const lobbies = await prisma.lobby.findMany({
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { participants: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(lobbies);
  } catch (error) {
    console.error('Get lobbies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMyLobbies = async (req, res) => {
  try {
    const userId = req.user.id;
    const lobbies = await prisma.lobby.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { participants: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(lobbies);
  } catch (error) {
    console.error('Get my lobbies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.joinLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const lobby = await prisma.lobby.findUnique({ where: { id } });
    if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

    const existingParticipant = await prisma.lobbyParticipant.findUnique({
      where: {
        userId_lobbyId: { userId, lobbyId: id }
      }
    });

    if (existingParticipant) {
      return res.status(400).json({ error: 'Already joined this lobby' });
    }

    const participant = await prisma.lobbyParticipant.create({
      data: {
        userId,
        lobbyId: id
      }
    });

    res.json({ message: 'Successfully joined lobby', participant });
  } catch (error) {
    console.error('Join lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLobbyById = async (req, res) => {
  try {
    const { id } = req.params;
    const lobby = await prisma.lobby.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          }
        }
      }
    });

    if (!lobby) {
      return res.status(404).json({ error: 'Lobby not found' });
    }

    res.json(lobby);
  } catch (error) {
    console.error('Get lobby by id error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getLobbyMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await prisma.lobbyMessage.findMany({
      where: { lobbyId: id },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get lobby messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const lobby = await prisma.lobby.findUnique({ where: { id } });
    if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

    if (lobby.creatorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this lobby' });
    }

    // Delete related records
    await prisma.lobbyParticipant.deleteMany({ where: { lobbyId: id } });
    await prisma.lobbyMessage.deleteMany({ where: { lobbyId: id } });

    // Delete lobby
    await prisma.lobby.delete({ where: { id } });

    res.json({ message: 'Lobby deleted successfully' });
  } catch (error) {
    console.error('Delete lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};