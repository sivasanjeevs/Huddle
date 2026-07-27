import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { lobbyService } from '../services/lobbyService';
import useAuthStore from '../store/authStore';
import ConfirmModal from '../components/ConfirmModal';

// Helper to get the base API URL (without /api suffix) for serving uploads
const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');

function LobbyWorkspace() {
  const { id } = useParams();
  const [lobby, setLobby] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [photos, setPhotos] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
    const socketUrl = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace('/api', '')
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
  };

  const isJoined = lobby?.participants?.some(p => p.userId === currentUser?.id);
  const isHost = lobby?.creatorId === currentUser?.id;

  const handleJoin = async () => {
    try {
      await lobbyService.joinLobby(id);
      const updatedLobby = await lobbyService.getLobbyById(id);
      setLobby(updatedLobby);
    } catch (error) {
      alert('Failed to join lobby');
    }
  };

  const handleLeave = async () => {
    if (window.confirm('Are you sure you want to leave this event?')) {
      try {
        await lobbyService.leaveLobby(id);
        const updatedLobby = await lobbyService.getLobbyById(id);
        setLobby(updatedLobby);
      } catch (error) {
        alert('Failed to leave lobby');
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
          <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors">
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
      
      <div className="max-w-[1400px] mx-auto px-4 py-6 flex gap-5 items-start relative z-10">

        {/* ─── LEFT COLUMN ──────────────────────────────────────────── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* TOP ROW: Event Details | Members */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Box 1: Event Details */}
            <div className="md:col-span-2 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 flex flex-col gap-4">
              {/* Category + Status badges */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                    {lobby.category}
                  </span>
                  <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${lobby.active ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                    {lobby.active ? '● Live' : 'Ended'}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-medium">{lobby.visibility}</span>
              </div>

              {/* Title + Description */}
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-tight mb-1.5">{lobby.title}</h1>
                <p className="text-sm text-slate-500 leading-relaxed line-clamp-3">{lobby.description}</p>
              </div>

              {/* Date / Time / Location */}
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="font-medium">{lobby.date} at {lobby.time}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm text-slate-600">
                  <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <span className="font-medium">{lobby.location}</span>
                </div>
                {lobby.maxParticipants && (
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <div className="w-7 h-7 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <span className="font-medium">Max {lobby.maxParticipants} participants</span>
                  </div>
                )}
              </div>

              {/* Host info */}
              <div className="flex items-center gap-2.5 pt-3">
                <img
                  src={lobby.creator?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${lobby.creatorId}`}
                  alt={lobby.creator?.name}
                  className="w-8 h-8 rounded-full border border-slate-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-400 font-medium">Hosted by</p>
                  <p className="text-sm font-semibold text-slate-700 truncate">{lobby.creator?.name}</p>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                {isHost ? (
                  <>
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
                  <button onClick={handleLeave} className="flex-1 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100">
                    Leave Event
                  </button>
                ) : (
                  <button onClick={handleJoin} className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    Join Event
                  </button>
                )}
              </div>
            </div>

            {/* Box 2: Members */}
            <div className="md:col-span-1 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-6 flex flex-col">
              <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
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
                        src={p.user.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${p.user.id}`}
                        alt={p.user.name}
                        className="w-9 h-9 rounded-full border-2 border-slate-200 group-hover:border-blue-300 transition-colors"
                      />
                      {p.user.id === lobby.creatorId && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
                          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
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
              <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
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
                <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
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
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
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
                      <div className="flex items-center justify-end">
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
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
        <div className="-mt-4 w-1/3 min-w-[320px] max-w-[450px] shrink-0 bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col sticky top-[25px]" style={{ height: 'calc(100vh - 80px)' }}>
          {/* Chat Header */}
          <div className="p-5 border-b border-white/50 bg-white/40 rounded-t-[2rem] flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
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
                    <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                    <p className="text-xs font-medium">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const isMe = msg.userId === currentUser?.id;
                    return (
                      <div key={msg.id || index} className={`flex gap-2 max-w-[90%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                        {!isMe && (
                          <img
                            src={msg.user?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${msg.userId}`}
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
              <form onSubmit={handleSendMessage} className="p-4 bg-white/50 rounded-b-[2rem] border-t border-white/50">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="w-full pl-5 pr-12 py-3.5 bg-white/80 border border-white/80 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-md"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
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
    </>
  );
}

export default LobbyWorkspace;
