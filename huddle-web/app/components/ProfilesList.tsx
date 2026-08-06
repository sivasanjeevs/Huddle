'use client';
import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import useAuthStore from '../store/authStore';
import { getDefaultAvatar } from '../utils/avatar';
export default function ProfilesList() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, onlineUsers } = useAuthStore();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const data = await userService.getProfiles();
        // Filter out the current user's profile
        setProfiles(data.filter(p => !user || p.id !== user.id));
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfiles();
  }, [user]);

  const handleFollowToggle = async (profileId, isFollowing) => {
    if (!user) {
      alert('Please log in to follow users.');
      return;
    }
    
    // Optimistic update
    setProfiles(profiles.map(p => {
      if (p.id === profileId) {
        return {
          ...p,
          isFollowing: !isFollowing,
          followersCount: p.followersCount + (isFollowing ? -1 : 1)
        };
      }
      return p;
    }));

    try {
      if (isFollowing) {
        await userService.unfollowUser(profileId);
      } else {
        await userService.followUser(profileId);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      // Revert on failure
      setProfiles(profiles.map(p => {
        if (p.id === profileId) {
          return {
            ...p,
            isFollowing,
            followersCount: p.followersCount + (isFollowing ? 1 : -1)
          };
        }
        return p;
      }));
    }
  };

  if (loading) {
    return (
      <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden mb-8 p-6 flex justify-center">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (profiles.length === 0) return null;

  return (
    <div className="w-full mb-8 relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/80 via-blue-50/60 to-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      {/* Decorative background glows */}
      <div className="absolute top-0 left-10 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-10 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl pointer-events-none translate-y-1/2"></div>
      
      <div className="relative z-10 px-8 pt-6 pb-2 flex items-baseline justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Discover People
          </h2>
          <p className="text-sm text-slate-500/80 font-medium mt-1">Connect with others in the community</p>
        </div>
      </div>
      
      <div className="relative z-10 px-6 pb-6 pt-4 overflow-x-auto scrollbar-hide">
        <div className="flex space-x-4 pb-4">
          {profiles.map(profile => (
            <div 
              key={profile.id} 
              className="w-36 shrink-0 rounded-2xl p-4 flex flex-col items-center bg-white/50 backdrop-blur-md border border-white shadow-sm hover:shadow-[0_8px_20px_rgb(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="relative w-16 h-16 rounded-full mb-3">
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-400 to-blue-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-md"></div>
                <img 
                  src={profile.avatar || getDefaultAvatar(profile.id)} 
                  alt={profile.name} 
                  className="relative w-full h-full object-cover rounded-full border-[3px] border-white shadow-sm bg-slate-100"
                />
                {/* Real online presence dot */}
                {onlineUsers.includes(profile.id) && (
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white presence-dot" title="Online" />
                )}
              </div>
              
              <h3 className="font-bold text-slate-700 text-center text-sm truncate w-full group-hover:text-blue-600 transition-colors">
                {profile.name}
              </h3>
              <p className="text-xs text-slate-400 truncate w-full text-center mt-1">
                {profile.workOrCollege || 'Member'}
              </p>
              
              <div className="text-[10px] font-semibold text-slate-400/80 mt-2 mb-4 uppercase tracking-wider">
                {profile.followersCount} Followers
              </div>
              
              <button
                onClick={() => handleFollowToggle(profile.id, profile.isFollowing)}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all duration-300 ${
                  profile.isFollowing 
                    ? 'bg-white/80 text-slate-500 hover:bg-slate-100 border border-slate-200/50'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/20 shadow-sm'
                }`}
              >
                {profile.isFollowing ? 'Following' : 'Follow'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
