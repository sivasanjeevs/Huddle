const prisma = require('../lib/prisma');
const aiService = require('../services/aiService');
const path = require('path');
const fs = require('fs');

exports.createLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, description, category, date, time, location, maxParticipants, visibility, tags, coverImage, categoryDetails } = req.body;

    let shortDescription = null;
    try {
      const aiResponse = await aiService.generateShortDescription(title, description, category);
      shortDescription = aiResponse.shortDescription;
    } catch (err) {
      console.error('Failed to generate short description:', err);
    }

    const lobby = await prisma.lobby.create({
      data: {
        title,
        description,
        shortDescription,
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
    const userId = req.user.id;
    const lobbies = await prisma.lobby.findMany({
      where: { active: true },
      include: {
        creator: { select: { id: true, name: true, avatar: true } },
        _count: { select: { participants: true, likes: true, comments: true } },
        likes: { where: { userId: userId }, select: { id: true } }
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
      return res.status(403).json({ error: 'Not authorized to end this event' });
    }

    // End the event by setting it to inactive instead of deleting it
    await prisma.lobby.update({
      where: { id },
      data: { active: false }
    });

    res.json({ message: 'Event ended successfully' });
  } catch (error) {
    console.error('Delete lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { title, description, category, active } = req.body;

    const lobby = await prisma.lobby.findUnique({ where: { id } });
    if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

    if (lobby.creatorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to update this event' });
    }

    const updatedLobby = await prisma.lobby.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(active !== undefined && { active }),
      }
    });

    res.json({ message: 'Lobby updated successfully', lobby: updatedLobby });
  } catch (error) {
    console.error('Update lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.hardDeleteLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const lobby = await prisma.lobby.findUnique({ where: { id } });
    if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

    if (lobby.creatorId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this event' });
    }

    // Delete related records first in a transaction to avoid foreign key constraint errors
    // Also delete photo files from disk
    const photosToDelete = await prisma.lobbyPhoto.findMany({ where: { lobbyId: id } });
    for (const photo of photosToDelete) {
      const filePath = path.join(__dirname, '..', 'uploads', photo.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.$transaction([
      prisma.lobbyParticipant.deleteMany({ where: { lobbyId: id } }),
      prisma.lobbyMessage.deleteMany({ where: { lobbyId: id } }),
      prisma.lobbyLike.deleteMany({ where: { lobbyId: id } }),
      prisma.lobbyComment.deleteMany({ where: { lobbyId: id } }),
      prisma.lobbyPhoto.deleteMany({ where: { lobbyId: id } }),
      prisma.lobby.delete({ where: { id } })
    ]);

    res.json({ message: 'Lobby permanently deleted' });
  } catch (error) {
    console.error('Hard delete lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: lobbyId } = req.params;

    const existingLike = await prisma.lobbyLike.findUnique({
      where: {
        userId_lobbyId: { userId, lobbyId }
      }
    });

    if (existingLike) {
      await prisma.lobbyLike.delete({
        where: { id: existingLike.id }
      });
      res.json({ message: 'Like removed', liked: false });
    } else {
      await prisma.lobbyLike.create({
        data: { userId, lobbyId }
      });
      res.json({ message: 'Lobby liked', liked: true });
    }
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { id: lobbyId } = req.params;
    const comments = await prisma.lobbyComment.findMany({
      where: { lobbyId, parentId: null },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: {
          include: {
            user: { select: { id: true, name: true, avatar: true } }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.postComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: lobbyId } = req.params;
    const { content, parentId } = req.body;

    if (!content) return res.status(400).json({ error: 'Content is required' });

    const comment = await prisma.lobbyComment.create({
      data: {
        content,
        userId,
        lobbyId,
        parentId: parentId || null
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
        replies: true
      }
    });
    res.status(201).json(comment);
  } catch (error) {
    console.error('Post comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.leaveLobby = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: lobbyId } = req.params;

    const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
    if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

    if (lobby.creatorId === userId) {
      return res.status(403).json({ error: 'Host cannot leave the lobby' });
    }

    const participant = await prisma.lobbyParticipant.findUnique({
      where: {
        userId_lobbyId: { userId, lobbyId }
      }
    });

    if (!participant) {
      return res.status(400).json({ error: 'You are not in this lobby' });
    }

    await prisma.lobbyParticipant.delete({
      where: { id: participant.id }
    });

    res.json({ message: 'Left lobby successfully' });
  } catch (error) {
    console.error('Leave lobby error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.uploadPhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id: lobbyId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
    if (!lobby) return res.status(404).json({ error: 'Lobby not found' });

    const photo = await prisma.lobbyPhoto.create({
      data: {
        lobbyId,
        userId,
        filename: req.file.filename,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      }
    });

    res.status(201).json(photo);
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPhotos = async (req, res) => {
  try {
    const { id: lobbyId } = req.params;

    const photos = await prisma.lobbyPhoto.findMany({
      where: { lobbyId },
      include: {
        user: { select: { id: true, name: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};