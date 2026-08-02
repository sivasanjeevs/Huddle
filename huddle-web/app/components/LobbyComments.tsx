'use client';
import React, { useState, useEffect } from 'react';
import { lobbyService } from '../services/lobbyService';
import useAuthStore from '../store/authStore';
import { getDefaultAvatar } from '../utils/avatar';

const timeAgo = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

function LobbyComments({ lobbyId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const { user } = useAuthStore();

  const fetchComments = async () => {
    try {
      const data = await lobbyService.getComments(lobbyId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [lobbyId]);

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await lobbyService.postComment(lobbyId, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  const handlePostReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    try {
      await lobbyService.postComment(lobbyId, { content: replyContent, parentId });
      setReplyingTo(null);
      setReplyContent('');
      fetchComments();
    } catch (error) {
      console.error('Failed to post reply', error);
    }
  };

  if (loading) return <div className="text-sm text-slate-500 py-4">Loading comments...</div>;

  return (
    <div className="mt-6 border-t border-slate-200/50 pt-6 bg-slate-50/40 backdrop-blur-md rounded-2xl p-5 shadow-inner">
      {/* Post new comment */}
      {user ? (
        <form onSubmit={handlePostComment} className="flex gap-3 mb-8 relative">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
          />
          <button type="submit" className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-all shadow-sm flex items-center justify-center">
            Post
          </button>
        </form>
      ) : (
        <div className="text-sm text-slate-500 mb-6">Please log in to comment.</div>
      )}

      {/* Comment list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-2">No comments yet. Be the first!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="text-sm relative mb-4">
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <img src={comment.user.avatar || getDefaultAvatar(comment.userId)} alt={comment.user.name} className="w-8 h-8 rounded-full bg-slate-200 z-10 shadow-sm" />
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="w-0.5 bg-slate-200/80 flex-1 my-1 rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 pb-1">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-slate-900 text-[13px] hover:underline cursor-pointer">{comment.user.name}</span>
                    <span className="text-slate-400 text-[12px]">•</span>
                    <span className="text-slate-400 text-[12px] font-medium">{timeAgo(comment.createdAt)}</span>
                  </div>
                  
                  {/* Content */}
                  <div className="text-slate-700 text-[14px] leading-relaxed mb-2">
                    {comment.content}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 text-[12px] text-slate-500 font-bold mb-2">
                    <button className="flex items-center gap-1.5 hover:bg-slate-200/50 px-2 py-1.5 rounded-md transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      Like
                    </button>
                    <button onClick={() => { setReplyingTo(comment.id); setReplyContent(''); }} className="flex items-center gap-1.5 hover:bg-slate-200/50 px-2 py-1.5 rounded-md transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Reply
                    </button>
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form onSubmit={(e) => handlePostReply(e, comment.id)} className="flex gap-2 mt-2 mb-4 max-w-md relative">
                      <input
                        type="text"
                        autoFocus
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        placeholder="Write a reply..."
                        className="flex-1 px-4 py-2.5 text-[13px] bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
                      />
                      <button type="submit" className="px-4 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 text-[13px] transition-all shadow-sm">Reply</button>
                      <button type="button" onClick={() => setReplyingTo(null)} className="px-2 text-slate-400 hover:text-slate-600">✕</button>
                    </form>
                  )}

                  {/* Replies List */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-2 space-y-4">
                      {comment.replies.map(reply => (
                        <div key={reply.id} className="flex gap-3">
                          <img src={reply.user.avatar || getDefaultAvatar(reply.userId)} alt={reply.user.name} className="w-6 h-6 rounded-full bg-slate-200 shadow-sm" />
                          <div className="flex-1">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-bold text-slate-900 text-[12px] hover:underline cursor-pointer">{reply.user.name}</span>
                              <span className="text-slate-400 text-[11px]">•</span>
                              <span className="text-slate-400 text-[11px] font-medium">{timeAgo(reply.createdAt)}</span>
                            </div>
                            {/* Content */}
                            <div className="text-slate-700 text-[13px] leading-relaxed mb-1.5">
                              {reply.content}
                            </div>
                            {/* Actions */}
                            <div className="flex items-center gap-1 text-[11px] text-slate-500 font-bold">
                              <button className="flex items-center gap-1.5 hover:bg-slate-200/50 px-2 py-1 rounded-md transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Like
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LobbyComments;
