import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lobbyService } from '../services/lobbyService';
import useAuthStore from '../store/authStore';
const GROUPED_CATEGORIES = [
  { 
    id: 1, 
    name: 'Tech & Professional', 
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=500&q=60',
    subCategories: ['💻 Technology', '💼 Business', '📚 Education']
  },
  { 
    id: 2, 
    name: 'Sports & Fitness', 
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=500&q=60',
    subCategories: ['⚽ Sports', '🧘 Health & Fitness']
  },
  { 
    id: 3, 
    name: 'Arts & Entertainment', 
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=500&q=60',
    subCategories: ['🎨 Design', '🎵 Music', '🎬 Entertainment', '🎭 Arts & Culture', '📸 Photography']
  },
  { 
    id: 4, 
    name: 'Gaming & Hobbies', 
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=500&q=60',
    subCategories: ['🎮 Gaming', '🔧 DIY & Hobbies']
  },
  { 
    id: 5, 
    name: 'Lifestyle & Social', 
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=500&q=60',
    subCategories: ['✈️ Travel', '🍔 Food', '❤️ Community', '🐶 Pets', '👨‍👩‍👧 Family', '🎉 Social']
  },
  { 
    id: 6, 
    name: 'Others', 
    image: 'https://images.unsplash.com/photo-1532619675605-1ede6c2ed2b0?auto=format&fit=crop&w=500&q=60',
    subCategories: ['🌐 Others']
  }
];

// ─── Home / Lobbies Page ──────────────────────────────────────────────────────
function Home() {
  const [search, setSearch] = useState('');
  const [lobbies, setLobbies] = useState([]);
  const [joinedLobbies, setJoinedLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const all = await lobbyService.getLobbies();
        const my = await lobbyService.getMyLobbies();
        setLobbies(all);
        setJoinedLobbies(my.map(l => l.id));
      } catch (error) {
        console.error("Failed to fetch lobbies", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleJoin = async (lobbyId) => {
    if (!joinedLobbies.includes(lobbyId)) {
      try {
        await lobbyService.joinLobby(lobbyId);
        setJoinedLobbies([...joinedLobbies, lobbyId]);
      } catch (error) {
        console.error("Failed to join lobby", error);
      }
    }
  };

  const handleDelete = async (lobbyId) => {
    if (window.confirm("Are you sure you want to end this event?")) {
      try {
        await lobbyService.deleteLobby(lobbyId);
        setLobbies(lobbies.filter(l => l.id !== lobbyId));
      } catch (error) {
        console.error("Failed to delete lobby", error);
        alert("Failed to delete the event.");
      }
    }
  };

  const filteredLobbies = lobbies.filter((l) => {
    const matchesSearch =
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.description.toLowerCase().includes(search.toLowerCase()) ||
      (l.category && l.category.toLowerCase().includes(search.toLowerCase()));
      
    const matchesCategory = selectedCategory 
      ? selectedCategory.subCategories.includes(l.category)
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ── LEFT: All Lobbies ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="text-blue-600">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <polygon points="16 8 14 14 8 16 10 10 16 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-slate-800 tracking-normal">
                  {selectedCategory ? `${selectedCategory.name} Lobbies` : 'Explore Lobbies'}
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  {selectedCategory ? `Showing events for ${selectedCategory.name.toLowerCase()}` : 'Find and join active communities'}
                </p>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lobbies by name, topic, or tag..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 relative bg-slate-50/30">
            {/* Subtle glowing orbs for glassmorphism background */}
            <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-300/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
            <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-purple-300/20 rounded-full blur-3xl pointer-events-none translate-x-1/4"></div>
            
            <div className="relative z-10 space-y-4">
              {loading ? (
                <div className="flex justify-center py-12">
                  <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
              ) : filteredLobbies.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">
                  <svg className="w-10 h-10 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No lobbies found
                </div>
              ) : (
                filteredLobbies.map((lobby) => {
                  const isJoined = joinedLobbies.includes(lobby.id);
                  const isCreator = user?.id === lobby.creator?.id;
                  return (
                    <div
                      key={lobby.id}
                      className="group p-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_12px_30px_-4px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-5 overflow-hidden"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-slate-800 text-lg tracking-tight">{lobby.title}</h3>
                          {lobby.category && (
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-slate-100/80 text-slate-600 rounded-full border border-slate-200/50 backdrop-blur-sm">
                              {lobby.category.replace(/[^a-zA-Z ]/g, "").trim()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mb-4 line-clamp-2 leading-relaxed">{lobby.description}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              {lobby.active && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
                              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${lobby.active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                            </span>
                            <span className="text-xs font-semibold text-slate-600">{lobby.active ? 'Live' : 'Idle'}</span>
                          </div>
                          <div className="h-1 w-1 rounded-full bg-slate-200"></div>
                          <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {lobby._count?.participants || 1} members
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 items-center">
                        {isCreator && (
                          <button
                            onClick={() => handleDelete(lobby.id)}
                            className="px-6 py-2.5 text-sm font-semibold text-red-600 bg-red-50/50 backdrop-blur-md border border-red-100/50 hover:bg-red-100/80 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] rounded-xl transition-all duration-300 text-center w-full sm:w-auto"
                          >
                            End Event
                          </button>
                        )}
                        {isJoined && (
                          <Link 
                            to={`/lobbies/${lobby.id}`}
                            className="px-6 py-2.5 text-sm font-semibold text-slate-700 bg-white/40 backdrop-blur-md border border-white/60 hover:bg-white/80 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.05)] rounded-xl transition-all duration-300 text-center w-full sm:w-auto"
                          >
                            View
                          </Link>
                        )}
                        <button
                          onClick={() => handleJoin(lobby.id)}
                          disabled={isJoined}
                          className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 w-full sm:w-auto backdrop-blur-md shadow-[0_4px_12px_-2px_rgba(37,99,235,0.15)] ${
                            isJoined 
                              ? 'bg-slate-50/50 text-slate-400 border border-slate-200/50 cursor-default shadow-none' 
                              : 'bg-blue-600/10 text-blue-700 border border-blue-500/20 hover:bg-blue-500/20 hover:shadow-[0_8px_20px_-4px_rgba(37,99,235,0.2)] hover:-translate-y-0.5'
                          }`}
                        >
                          {isJoined ? 'Joined' : 'Join Lobby'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Categories ──────────────────────────────────────────── */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="text-purple-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="4" y="4" width="7" height="7" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="13" y="4" width="7" height="16" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <rect x="4" y="13" width="7" height="7" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-medium text-slate-800 tracking-normal">Categories</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Browse by topic</p>
                </div>
              </div>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className="text-xs font-semibold text-blue-600 bg-blue-50/50 backdrop-blur-md border border-blue-100/50 hover:bg-blue-100/50 px-4 py-2 rounded-xl transition-all shadow-[0_2px_8px_-2px_rgba(37,99,235,0.1)]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
            {GROUPED_CATEGORIES.map((category) => {
              const isSelected = selectedCategory?.id === category.id;
              return (
                <div 
                  key={category.id}
                  onClick={() => setSelectedCategory(isSelected ? null : category)}
                  className={`group relative h-28 rounded-xl overflow-hidden cursor-pointer shadow-sm border transition-all ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  {/* Category Image */}
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 bg-slate-200 ${
                      isSelected ? 'scale-110' : 'group-hover:scale-110'
                    }`}
                  />
                  
                  {/* Overlay */}
                  <div className={`absolute inset-0 transition-colors duration-300 ${
                    isSelected 
                      ? 'bg-gradient-to-t from-blue-900/90 to-blue-900/40' 
                      : 'bg-gradient-to-t from-slate-900/80 to-slate-900/20 group-hover:from-slate-900/90 group-hover:to-slate-900/30'
                  }`}></div>
                  
                  {/* Text Content */}
                  <div className="absolute inset-0 p-4 flex flex-col justify-end">
                    <h3 className="text-white font-bold text-lg tracking-wide">{category.name}</h3>
                    <div className={`flex items-center text-xs font-medium mt-1 transition-all duration-300 ${
                      isSelected ? 'text-blue-200 opacity-100 translate-y-0' : 'text-slate-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                    }`}>
                      {isSelected ? 'Viewing lobbies' : 'Explore lobbies'}
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Home;
