'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { io } from 'socket.io-client';
import {
  Calendar, MapPin, Users, MessageSquare, Image as ImageIcon,
  Crown, Lock, Send, Smile, Upload, Download, Trash2,
  X, ChevronLeft, Pencil, CircleDot, Eye, AlertTriangle
} from 'lucide-react';
import { getDefaultAvatar } from '../../utils/avatar';
import { lobbyService } from '../../services/lobbyService';
import useAuthStore from '../../store/authStore';
import ConfirmModal from '../../components/ConfirmModal';
import EmojiPicker from 'emoji-picker-react';

// Helper to get the base API URL (without /api suffix) for serving uploads
const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api').replace('/api', '');

function LobbyWorkspace() {
  const { id } = useParams();
  const [lobby, setLobby] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [isEditingEvent, setIsEditingEvent] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);
  const [showFullDesc, setShowFullDesc] = useState(false);
  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, loading: false });
  const { user: currentUser } = useAuthStore();
  const socketRef = useRef(null);
  const chatContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const loadPhotos = async () => {
    try {
      const data = await lobbyService.getPhotos(id);
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load photos', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lobbyData, messagesData] = await Promise.all([
          lobbyService.getLobbyById(id),
          lobbyService.getLobbyMessages(id)
        ]);
        setLobby(lobbyData);
        setMessages(messagesData);
        await loadPhotos();
      } catch (err) {
        console.error('Failed to load lobby workspace', err);
        setError('Failed to load lobby workspace.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const token = localStorage.getItem('huddle_token');
    const socketUrl = process.env.NEXT_PUBLIC_API_URL
      ? process.env.NEXT_PUBLIC_API_URL.replace('/api', '')
      : 'http://localhost:3001';

    socketRef.current = io(socketUrl, { auth: { token } });
    socketRef.current.on('connect', () => {
      socketRef.current.emit('join_lobby', id);
    });
    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser) return;
    socketRef.current.emit('send_message', {
      lobbyId: id,
      userId: currentUser.id,
      content: newMessage.trim()
    });
    setNewMessage('');
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
  };

  const isJoined = lobby?.participants?.some(p => p.userId === currentUser?.id);
  const isHost = lobby?.creatorId === currentUser?.id;

  const handleJoin = async () => {
    if (isJoining) return;
    setIsJoining(true);
    try {
      await lobbyService.joinLobby(id);
      const updatedLobby = await lobbyService.getLobbyById(id);
      setLobby(updatedLobby);
    } catch (error) {
      alert('Failed to join lobby');
    } finally {
      setIsJoining(false);
    }
  };

  const handleLeave = async () => {
    if (isLeaving) return;
    if (window.confirm('Are you sure you want to leave this event?')) {
      setIsLeaving(true);
      try {
        await lobbyService.leaveLobby(id);
        const updatedLobby = await lobbyService.getLobbyById(id);
        setLobby(updatedLobby);
      } catch (error) {
        alert('Failed to leave lobby');
      } finally {
        setIsLeaving(false);
      }
    }
  };

  const handleEndEvent = async () => {
    setConfirmModal(m => ({ ...m, loading: true }));
    try {
      await lobbyService.deleteLobby(id);
      setConfirmModal({ open: false, type: null, loading: false });
      window.location.href = '/';
    } catch (error) {
      setConfirmModal(m => ({ ...m, loading: false }));
      const msg = error?.response?.data?.error || 'Failed to end the event.';
      alert(`Error: ${msg}`);
    }
  };

  const handlePermanentDelete = async () => {
    setConfirmModal(m => ({ ...m, loading: true }));
    try {
      await lobbyService.hardDeleteLobby(id);
      setConfirmModal({ open: false, type: null, loading: false });
      window.location.href = '/';
    } catch (error) {
      setConfirmModal(m => ({ ...m, loading: false }));
      const msg = error?.response?.data?.error || 'Failed to delete the event.';
      alert(`Error: ${msg}`);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isEditSubmitting) return;
    setIsEditSubmitting(true);
    try {
      const response = await lobbyService.updateLobby(id, editFormData);
      setLobby(response.lobby);
      setIsEditingEvent(false);
    } catch (error) {
      alert(error?.response?.data?.error || 'Failed to update event.');
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const openEditModal = () => {
    setEditFormData({
      title: lobby.title,
      description: lobby.description,
      location: lobby.location,
      date: lobby.date,
      time: lobby.time,
      maxParticipants: lobby.maxParticipants || '',
      visibility: lobby.visibility,
    });
    setIsEditingEvent(true);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await lobbyService.uploadPhoto(id, formData);
      await loadPhotos();
    } catch (err) {
      console.error('Failed to upload photo', err);
      alert('Failed to upload photo. Max size is 15MB.');
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleDownloadPhoto = (filename) => {
    const url = `${API_BASE}/uploads/${filename}`;
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDeletePhoto = async (photoId) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      try {
        await lobbyService.deletePhoto(id, photoId);
        await loadPhotos();
      } catch (err) {
        console.error('Failed to delete photo', err);
        alert('Failed to delete photo.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 text-sm font-medium">Loading workspace...</p>
        </div>
      </div>
    );
  }

  if (error || !lobby) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 flex justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Workspace</h2>
          <p className="text-slate-500 mb-6">{error || 'Lobby not found'}</p>
          <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const mapQuery = encodeURIComponent(lobby.location || 'India');

  return (
    <>
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-blue-50 via-white to-sky-100 relative overflow-hidden">
      {/* Background glassmorphism orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/30 rounded-full blur-[100px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-indigo-300/20 rounded-full blur-[120px] pointer-events-none translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-[1400px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-5 items-start relative z-10">

        {/* ─── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* TOP ROW: Event Details | Members */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Box 1: Event Details */}
            <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 flex flex-col gap-4">
              {/* Category + Status badges */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-lg border border-slate-200">
                    {lobby.category}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border flex items-center gap-1 ${lobby.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    <CircleDot className="w-3 h-3" />
                    {lobby.active ? 'Live' : 'Ended'}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                  {lobby.visibility === 'Private' ? <Lock className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {lobby.visibility}
                </span>
              </div>

              {/* Title + Description */}
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight mb-1.5">{lobby.title}</h1>
                <p className={`text-sm text-slate-500 leading-relaxed ${!showFullDesc ? 'line-clamp-3' : ''}`}>{lobby.description}</p>
                {lobby.description && lobby.description.length > 160 && (
                  <button
                    onClick={() => setShowFullDesc(v => !v)}
                    className="mt-1.5 text-xs font-semibold text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    {showFullDesc ? 'Show less ↑' : 'Show more ↓'}
                  </button>
                )}
              </div>

              {/* Date / Time / Location / Participants */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <Calendar className="w-4 h-4 text-black shrink-0" />
                  <span className="font-medium">{lobby.date} at {lobby.time}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-700">
                  <MapPin className="w-4 h-4 text-black shrink-0" />
                  <span className="font-medium">{lobby.location}</span>
                </div>
                {lobby.maxParticipants && (
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <Users className="w-4 h-4 text-black shrink-0" />
                    <span className="font-medium">Max {lobby.maxParticipants} participants</span>
                  </div>
                )}
              </div>

              {/* Host info */}
              <div className="flex items-center gap-2.5 pt-2 border-t border-slate-100">
                <img
                  src={lobby.creator?.avatar || getDefaultAvatar(lobby.creatorId)}
                  alt={lobby.creator?.name}
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Hosted by</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{lobby.creator?.name}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2">
                {isHost ? (
                  <>
                    <button onClick={openEditModal} className="flex-1 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-1.5">
                      <Pencil className="w-3 h-3 text-black" /> Edit Event
                    </button>
                    {lobby.active && (
                      <button onClick={() => setConfirmModal({ open: true, type: 'end', loading: false })} className="flex-1 py-2 text-xs font-bold text-amber-600 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-100">
                        End Event
                      </button>
                    )}
                    <button onClick={() => setConfirmModal({ open: true, type: 'delete', loading: false })} className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
                      Delete
                    </button>
                  </>
                ) : isJoined ? (
                  <button onClick={handleLeave} disabled={isLeaving} className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-60 rounded-lg transition-colors border border-red-100">
                    {isLeaving ? 'Leaving...' : 'Leave Event'}
                  </button>
                ) : (
                  <button onClick={handleJoin} disabled={isJoining} className="flex-1 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-60 rounded-lg transition-colors">
                    {isJoining ? 'Joining...' : 'Join Event'}
                  </button>
                )}
              </div>
            </div>

            {/* Box 2: Members */}
            <div className="md:col-span-1 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-black" />
                Members
                <span className="ml-auto bg-slate-100 text-slate-500 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                  {lobby.participants?.length || 0}
                </span>
              </h3>
              <div className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: '240px' }}>
                {lobby.participants?.map((p) => (
                  <div key={p.user.id} className="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded-xl transition-colors group">
                    <div className="relative shrink-0">
                      <img
                        src={p.user.avatar || getDefaultAvatar(p.user.id)}
                        alt={p.user.name}
                        className="w-9 h-9 rounded-full border-2 border-slate-200 group-hover:border-blue-300 transition-colors"
                      />
                      {p.user.id === lobby.creatorId && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                          <Crown className="w-2.5 h-2.5 text-white" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.user.name}</p>
                      {p.user.id === lobby.creatorId && (
                        <p className="text-[10px] text-amber-600 font-bold">Host</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* GOOGLE MAPS */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5">
              <MapPin className="w-4 h-4 text-black shrink-0" />
              <div>
                <p className="text-sm font-bold text-slate-800">Event Location</p>
                <p className="text-xs text-slate-400">{lobby.location}</p>
              </div>
            </div>
            <iframe
              title="Event Location"
              src={`https://maps.google.com/maps?q=${mapQuery}&output=embed&z=15`}
              width="100%"
              height="300"
              style={{ border: 'none', display: 'block' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>

          {/* PHOTO GALLERY */}
          <div className="bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <ImageIcon className="w-4 h-4 text-black shrink-0" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Event Memories</p>
                  <p className="text-xs text-slate-400">{photos.length} photo{photos.length !== 1 ? 's' : ''} shared</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isJoined && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl transition-colors shadow-sm"
                    >
                      {uploadingPhoto ? (
                        <>
                          <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 text-white" />
                          Upload Photo
                        </>
                      )}
                    </button>
                  </>
                )}
                {lobby.driveFolderLink ? (
                  <a
                    href={lobby.driveFolderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-sm"
                  >
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Go to Drive
                  </a>
                ) : (
                  <button
                    disabled
                    title="No Drive folder linked to this event (Event created before Drive integration)"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded-xl cursor-not-allowed shadow-sm"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Go to Drive
                  </button>
                )}
              </div>
            </div>

            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                <svg className="w-14 h-14 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <p className="text-sm font-medium text-slate-400">No photos yet</p>
                <p className="text-xs text-slate-300 mt-1">Be the first to share a memory!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 hover:border-slate-300 transition-all hover:shadow-md">
                    <img
                      src={`${API_BASE}/api/lobbies/${id}/photos/${photo.id}/stream`}
                      alt={`Photo by ${photo.user?.name}`}
                      className="w-full h-full object-cover"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                      <p className="text-white text-[10px] font-semibold truncate mb-1">{photo.user?.name}</p>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleDownloadPhoto(photo.filename)}
                          className="flex items-center justify-center p-1.5 backdrop-blur-sm rounded-lg text-white bg-slate-700/80 hover:bg-slate-700 border border-white/10 transition-colors"
                          title="Download"
                        >
                          <Download className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (currentUser?.id === photo.userId || isHost) {
                              handleDeletePhoto(photo.id);
                            } else {
                              alert("You don't have permission to delete this photo!");
                            }
                          }}
                          className={`flex items-center justify-center p-1.5 backdrop-blur-sm rounded-lg transition-colors border ${
                            (currentUser?.id === photo.userId || isHost)
                              ? 'text-white bg-red-500/80 hover:bg-red-500 border-red-500/50'
                              : 'text-white/50 bg-slate-500/30 border-slate-500/30 cursor-not-allowed'
                          }`}
                          title={currentUser?.id === photo.userId || isHost ? "Delete Photo" : "Only the photo owner or host can delete"}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ─── RIGHT COLUMN: CHAT ──────────────────────────────────── */}
        <div className="lg:-mt-4 w-full lg:w-1/3 lg:min-w-[320px] lg:max-w-[450px] shrink-0 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col sticky top-[25px]" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Chat Header */}
          <div className="p-5 border-b border-white/50 bg-white/40 rounded-t-[2rem] flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-black shrink-0" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Lobby Chat</h3>
              <p className="text-[10px] text-slate-400">{lobby.participants?.length || 0} members</p>
            </div>
          </div>

          {!isJoined ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <svg className="w-14 h-14 text-slate-200 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <h3 className="text-sm font-bold text-slate-600 mb-1">Members Only Chat</h3>
              <p className="text-xs text-slate-400 mb-4">Join this lobby to chat</p>
              <button onClick={handleJoin} className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-5 rounded-xl transition-colors">
                Join to Chat
              </button>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-transparent" ref={chatContainerRef}>
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-300">
                    <MessageSquare className="w-10 h-10 mb-2" />
                    <p className="text-xs font-medium">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.userId === currentUser?.id;
                    return (
                      <div key={msg.id || index} className={`flex gap-2 max-w-[90%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                        {!isMe && (
                          <img
                            src={msg.user?.avatar || getDefaultAvatar(msg.userId)}
                            alt={msg.user?.name}
                            className="w-7 h-7 rounded-full border border-slate-200 shrink-0 mt-1"
                          />
                        )}
                        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          {!isMe && <span className="text-[10px] font-semibold text-slate-400 mb-0.5 ml-1">{msg.user?.name}</span>}
                          <div className={`px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'}`}>
                            {msg.content}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white/50 rounded-b-[2rem] border-t border-white/50 relative">
                {showEmojiPicker && (
                  <div className="absolute bottom-20 left-4 z-50">
                    <EmojiPicker onEmojiClick={onEmojiClick} height={350} width={300} />
                  </div>
                )}
                <div className="relative flex items-center bg-white/80 border border-white/80 rounded-2xl shadow-sm transition-all focus-within:ring-4 focus-within:ring-blue-500/10 focus-within:border-blue-400">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="pl-4 pr-2 py-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                  >
                    <Smile className="w-6 h-6" />
                  </button>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full px-2 py-3.5 bg-transparent text-sm focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="mr-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

      </div>
    </div>

      {/* End Event Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === 'end'}
        onClose={() => setConfirmModal({ open: false, type: null, loading: false })}
        onConfirm={handleEndEvent}
        loading={confirmModal.loading}
        title="End this event?"
        message="This will mark the event as inactive. Participants will no longer see it in the live feed, but the event record will be kept."
        confirmText="End Event"
        confirmColor="amber"
      />

      {/* Delete Permanently Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === 'delete'}
        onClose={() => setConfirmModal({ open: false, type: null, loading: false })}
        onConfirm={handlePermanentDelete}
        loading={confirmModal.loading}
        title="Delete permanently?"
        message="This will permanently remove the event, all messages, members, and uploaded photos. This action cannot be undone."
        confirmText="Delete Forever"
        confirmColor="red"
      />

      {/* Edit Event Modal */}
      {isEditingEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in relative border border-slate-100 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xl text-slate-800">Edit Event</h3>
              <button onClick={() => setIsEditingEvent(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <input type="text" value={editFormData.title} onChange={e => setEditFormData({...editFormData, title: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400" required />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea value={editFormData.description} onChange={e => setEditFormData({...editFormData, description: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400" rows="3" required></textarea>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                <input type="text" value={editFormData.location} onChange={e => setEditFormData({...editFormData, location: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Date</label>
                  <input type="date" value={editFormData.date} onChange={e => setEditFormData({...editFormData, date: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Time</label>
                  <input type="time" value={editFormData.time} onChange={e => setEditFormData({...editFormData, time: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Participants</label>
                  <input type="number" value={editFormData.maxParticipants} onChange={e => setEditFormData({...editFormData, maxParticipants: e.target.value})} placeholder="Unlimited if empty" className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Visibility</label>
                  <select value={editFormData.visibility} onChange={e => setEditFormData({...editFormData, visibility: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-400">
                    <option value="Public">Public</option>
                    <option value="Private">Private</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button type="button" onClick={() => setIsEditingEvent(false)} className="px-5 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold transition-colors">Cancel</button>
                <button type="submit" disabled={isEditSubmitting} className="px-5 py-2 text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-xl font-bold transition-colors shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
                  {isEditSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default LobbyWorkspace;
