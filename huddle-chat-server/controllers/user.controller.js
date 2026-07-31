const prisma = require('../lib/prisma');

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, email: true, name: true, avatar: true, 
        workOrCollege: true, bio: true, interests: true, 
        skills: true, location: true, socialLinks: true,
        favoriteCategories: true, lookingFor: true, preferences: true,
        googleId: true, createdAt: true,
        followers: { select: { id: true, name: true, avatar: true } },
        following: { select: { id: true, name: true, avatar: true } },
        createdLobbies: { select: { id: true, title: true, date: true, time: true, coverImage: true, category: true, active: true } },
        participatingLobbies: {
          select: {
            lobby: {
              select: { id: true, title: true, date: true, time: true, coverImage: true, category: true, active: true }
            }
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, avatar, workOrCollege, bio, interests, skills, location, socialLinks, favoriteCategories, lookingFor, preferences } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name, avatar, workOrCollege, bio, interests, skills, location, socialLinks, favoriteCategories, lookingFor, preferences },
      select: { 
        id: true, email: true, name: true, avatar: true,
        workOrCollege: true, bio: true, interests: true,
        skills: true, location: true, socialLinks: true,
        favoriteCategories: true, lookingFor: true, preferences: true,
        followers: { select: { id: true, name: true, avatar: true } },
        following: { select: { id: true, name: true, avatar: true } },
        createdLobbies: { select: { id: true, title: true, date: true, time: true, coverImage: true, category: true, active: true } },
        participatingLobbies: {
          select: {
            lobby: {
              select: { id: true, title: true, date: true, time: true, coverImage: true, category: true, active: true }
            }
          }
        }
      },
    });

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllProfiles = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user.id : null;
    const users = await prisma.user.findMany({
      select: {
        id: true, name: true, avatar: true, workOrCollege: true, bio: true,
        interests: true, skills: true,
        followers: { select: { id: true } }
      },
      take: 20
    });
    
    // Check if the current user is following them
    const profiles = users.map(u => ({
      ...u,
      isFollowing: currentUserId ? u.followers.some(f => f.id === currentUserId) : false,
      followersCount: u.followers.length
    }));
    
    res.json(profiles);
  } catch (error) {
    console.error('Get all profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    if (targetUserId === currentUserId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }
    await prisma.user.update({
      where: { id: currentUserId },
      data: { following: { connect: { id: targetUserId } } }
    });
    res.json({ success: true, message: "User followed successfully" });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user.id;
    await prisma.user.update({
      where: { id: currentUserId },
      data: { following: { disconnect: { id: targetUserId } } }
    });
    res.json({ success: true, message: "User unfollowed successfully" });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
