const prisma = require('../lib/prisma');
const aiService = require('../services/aiService');
const driveService = require('../services/driveService');
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

    let driveFolderId = null;
    let driveFolderLink = null;
    try {
      const folderRes = await driveService.createEventFolder(title);
      if (folderRes) {
        driveFolderId = folderRes.id;
        driveFolderLink = folderRes.link;
      }
    } catch (err) {
      console.error('Failed to create drive folder:', err);
    }

    const lobby = await prisma.lobby.create({
      data: {
        title,
        description,
        shortDescription,
        driveFolderId,
        driveFolderLink,
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

    if (driveFolderId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        driveService.shareFolderWithUser(driveFolderId, user.email).catch(console.error);
      }
    }

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

    if (lobby.driveFolderId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user && user.email) {
        driveService.shareFolderWithUser(lobby.driveFolderId, user.email).catch(console.error);
      }
    }

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

    let driveFileId = null;
    let driveWebViewLink = null;

    if (!lobby.driveFolderId) {
      try {
        const folderRes = await driveService.createEventFolder(lobby.title);
        if (folderRes) {
          lobby.driveFolderId = folderRes.id;
          lobby.driveFolderLink = folderRes.link;
          await prisma.lobby.update({
            where: { id: lobbyId },
            data: {
              driveFolderId: folderRes.id,
              driveFolderLink: folderRes.link
            }
          });
        }
      } catch (err) {
        console.error('Failed to create drive folder during photo upload:', err);
      }
    }

    if (lobby.driveFolderId) {
      try {
        // Find user name for metadata
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const driveResponse = await driveService.uploadPhoto(
          lobby.driveFolderId,
          req.file.buffer, // Using memory buffer
          req.file.mimetype,
          req.file.originalname,
          userId,
          user ? user.name : 'Unknown User'
        );
        if (driveResponse) {
          driveFileId = driveResponse.fileId;
          driveWebViewLink = driveResponse.webViewLink;
        } else {
           return res.status(500).json({ error: 'Google Drive quota exceeded or configuration error. Use OAuth 2.0 or a Shared Drive.' });
        }
      } catch (err) {
        console.error('Failed to upload to drive:', err);
        return res.status(500).json({ error: 'Failed to upload photo to Drive' });
      }
    } else {
       return res.status(500).json({ error: 'Drive folder not configured or creation failed' });
    }

    // Do NOT save to PostgreSQL database. Return the live drive metadata.
    res.status(201).json({
       id: driveFileId,
       driveFileId: driveFileId,
       driveWebViewLink: driveWebViewLink,
       lobbyId: lobbyId,
       userId: userId,
       user: { id: userId }
    });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPhotos = async (req, res) => {
  try {
    const { id: lobbyId } = req.params;

    const lobby = await prisma.lobby.findUnique({ where: { id: lobbyId } });
    if (!lobby || !lobby.driveFolderId) {
      return res.json([]);
    }

    const driveFiles = await driveService.listFiles(lobby.driveFolderId);
    
    // Map Drive files to the structure expected by the frontend
    const photos = driveFiles.map(file => ({
      id: file.id,
      lobbyId: lobbyId,
      userId: file.appProperties?.userId || 'unknown',
      filename: file.name,
      driveFileId: file.id,
      driveWebViewLink: file.webViewLink,
      user: {
        id: file.appProperties?.userId || 'unknown',
        name: file.appProperties?.userName || 'Unknown User'
      }
    }));

    res.json(photos);
  } catch (error) {
    console.error('Get photos error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deletePhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    
    // We only need to delete from Google Drive since DB is not used
    await driveService.deletePhoto(photoId);

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.streamPhoto = async (req, res) => {
  try {
    const { photoId } = req.params;
    
    // In our cloud-only approach, photoId IS the driveFileId
    const driveStream = await driveService.getFileStream(photoId);
    if (driveStream) {
      driveStream.pipe(res);
      return;
    }
    
    res.status(404).json({ error: 'Photo file not found on drive' });
  } catch (err) {
    console.error('Stream photo error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};