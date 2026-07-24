import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { lobbyService } from '../services/lobbyService';

function LobbyWorkspace() {
  const { id } = useParams();
  const [lobby, setLobby] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const userStr = localStorage.getItem('huddle_user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }

    const fetchData = async () => {
      try {
        const [lobbyData, messagesData] = await Promise.all([
          lobbyService.getLobbyById(id),
          lobbyService.getLobbyMessages(id)
        ]);
        setLobby(lobbyData);
        setMessages(messagesData);
      } catch (err) {
        console.error("Failed to load lobby workspace", err);
        setError("Failed to load lobby workspace.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Setup Socket.io
    const token = localStorage.getItem('huddle_token');
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3001';
    
    socketRef.current = io(socketUrl, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected:', socketRef.current.id);
      socketRef.current.emit('join_lobby', id);
    });

    socketRef.current.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex justify-center py-20">
        <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !lobby) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 flex justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center max-w-md">
          <div className="text-red-500 mb-4 flex justify-center">
             <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Workspace</h2>
          <p className="text-slate-500 mb-6">{error || "Lobby not found"}</p>
          <Link to="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6 h-[calc(100vh-120px)]">
        
        {/* Left Column: Event Details (2/3 width) */}
        <div className="lg:w-2/3 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
          
          {/* Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            {lobby.coverImage ? (
              <div className="h-48 w-full bg-slate-200">
                <img src={lobby.coverImage} alt={lobby.title} className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="h-32 w-full bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            )}
            
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-600 rounded-lg border border-blue-100">
                  {lobby.category}
                </span>
                <span className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-600 rounded-lg border border-slate-200">
                  {lobby.visibility}
                </span>
              </div>
              
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{lobby.title}</h1>
              <p className="text-slate-600 text-lg mb-6">{lobby.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{lobby.date}</p>
                    <p className="text-xs text-slate-500">{lobby.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{lobby.location}</p>
                    <p className="text-xs text-slate-500">Venue</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details & Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Category Details */}
            {lobby.categoryDetails && Object.keys(lobby.categoryDetails).length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Event Details
                </h3>
                <div className="space-y-3">
                  {Object.entries(lobby.categoryDetails).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="text-sm font-medium text-slate-800">{value || 'N/A'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Members */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Members ({lobby.participants?.length || 0})
                </div>
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-3 max-h-48 custom-scrollbar">
                {lobby.participants?.map((p) => (
                  <div key={p.user.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                    <img 
                      src={p.user.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${p.user.id}`} 
                      alt={p.user.name} 
                      className="w-10 h-10 rounded-full border border-slate-200"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {p.user.name} {p.user.id === lobby.creatorId && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md">Host</span>}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
          </div>
          
          {/* Photos Placeholder */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
               <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               Photos
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-slate-100 rounded-xl border border-dashed border-slate-300 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors">
                    <span className="text-2xl text-slate-300">+</span>
                  </div>
                ))}
             </div>
          </div>
          
        </div>

        {/* Right Column: Chat (1/3 width) */}
        <div className="lg:w-1/3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur flex justify-between items-center">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              Lobby Chat
            </h3>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/30">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <svg className="w-12 h-12 mb-3 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <p className="text-sm font-medium">No messages yet.</p>
                <p className="text-xs">Say hello to the group!</p>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.userId === currentUser?.id;
                return (
                  <div key={msg.id || index} className={`flex gap-3 max-w-[85%] ${isMe ? 'ml-auto flex-row-reverse' : ''}`}>
                    {!isMe && (
                      <img 
                        src={msg.user?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${msg.userId}`} 
                        alt={msg.user?.name} 
                        className="w-8 h-8 rounded-full border border-slate-200 shrink-0 mt-1"
                      />
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      {!isMe && <span className="text-xs font-semibold text-slate-500 mb-1 ml-1">{msg.user?.name}</span>}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                        isMe 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100">
            <div className="relative flex items-center">
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..." 
                className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit" 
                disabled={!newMessage.trim()}
                className="absolute right-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}

export default LobbyWorkspace;
