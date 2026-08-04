'use client';
import React from 'react';
import Link from 'next/link';
import LobbyComments from './LobbyComments';
import { GROUPED_CATEGORIES } from '../constants/categories';

export default function LobbyCard({
  lobby,
  user,
  joinedLobbies,
  expandedComments,
  handleLike,
  toggleComments,
  handleJoin,
  setSelectedCategory,
  setConfirmModal
}) {
  const isJoined = joinedLobbies.includes(lobby.id);
  const isCreator = user?.id === lobby.creator?.id;

  const handleShare = async () => {
    const url = `${window.location.origin}/lobbies/${lobby.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: lobby.title,
          text: `Check out ${lobby.title} on Huddle!`,
          url: url,
        });
      } catch (err) {
        console.error('Share failed:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  return (
    <div className="group bg-white/60 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/80 rounded-3xl overflow-hidden flex transition-all duration-300 mb-6">
      {/* Main Content */}
      <div className="flex-1 p-4 sm:p-6 flex flex-col min-w-0">
        {/* Post Meta Header */}
        <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
          {lobby.category && (
            <span 
              onClick={() => {
                const catObj = GROUPED_CATEGORIES.find(c => c.subCategories.includes(lobby.category));
                if (catObj) setSelectedCategory(catObj);
              }}
              className="font-bold text-slate-800 hover:underline cursor-pointer"
            >
              h/{(lobby.category.replace(/[^a-zA-Z ]/g, "").trim().replace(/\s+/g, '')).toLowerCase()}
            </span>
          )}
          <span className="text-slate-500">•</span>
          <span className="text-slate-500">
            Posted by u/{lobby.creator?.name || 'unknown'}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-500 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
            {lobby._count?.participants || 1} {lobby.maxParticipants ? `/ ${lobby.maxParticipants}` : ''} participants
          </span>
          <span className="text-slate-500 flex items-center gap-1 ml-auto">
            <span className="relative flex h-2 w-2">
              {lobby.active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={`relative inline-flex rounded-full h-2 w-2 ${lobby.active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
            </span>
            {lobby.active ? 'Live Now' : 'Idle'}
          </span>
        </div>

        {/* Post Title & Content */}
        <h3 className="font-bold text-slate-900 text-xl tracking-tight mb-2 mt-2 leading-tight">{lobby.title}</h3>
        <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed">
          {lobby.shortDescription || lobby.description}
        </p>

        {/* Post Action Footer */}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-slate-500 font-semibold text-xs">
            <button 
              onClick={() => handleLike(lobby.id)}
              className={`flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1.5 rounded transition-colors ${lobby.likes?.length > 0 ? 'text-red-500' : ''}`}
            >
              <svg className="w-4 h-4" fill={lobby.likes?.length > 0 ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {lobby._count?.likes || 0} Likes
            </button>
            <button 
              onClick={() => toggleComments(lobby.id)}
              className="flex items-center gap-1.5 hover:bg-slate-100 px-2 py-1.5 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {lobby._count?.comments || 0} Comments
            </button>
            <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-slate-100 rounded-lg transition-colors font-medium text-slate-600 hover:text-slate-900 group">
              <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
              Share
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            {isCreator && (
              <button
                onClick={() => setConfirmModal({ open: true, targetId: lobby.id, loading: false })}
                className="px-4 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-200"
              >
                End Event
              </button>
            )}
            <Link 
              href={`/lobbies/${lobby.id}`}
              className="px-5 py-2 text-sm font-semibold text-slate-700 bg-slate-100/80 hover:bg-slate-200 rounded-xl transition-all"
            >
              View
            </Link>
            <button
              onClick={() => handleJoin(lobby.id)}
              disabled={isJoined}
              className={`px-5 py-2 text-sm font-semibold rounded-xl transition-all shadow-sm ${
                isJoined 
                  ? 'bg-slate-100 text-slate-400 cursor-default shadow-none' 
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {isJoined ? 'Joined' : 'Join'}
            </button>
          </div>
        </div>

        {/* Inline Comments Section */}
        {expandedComments.includes(lobby.id) && (
          <LobbyComments lobbyId={lobby.id} />
        )}
      </div>
    </div>
  );
}
