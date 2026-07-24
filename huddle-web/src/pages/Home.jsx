import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { lobbyService } from '../services/lobbyService';
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
            <div className="flex items-center gap-3 mb-4">

              <div>
                <h2 className="text-lg font-medium text-slate-900">
                  {selectedCategory ? `${selectedCategory.name} Lobbies` : 'Explore Lobbies'}
                </h2>
                <p className="text-sm text-slate-500 font-medium">
                  {selectedCategory ? `Showing events for ${selectedCategory.name.toLowerCase()}` : 'Find and join active communities'}
                </p>
              </div>
            </div>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lobbies by name, topic, or tag..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
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
                return (
                  <div
                    key={lobby.id}
                    className="p-4 bg-white border border-slate-200 hover:border-blue-300 rounded-xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-slate-800 text-base">{lobby.title}</h3>
                        {lobby.category && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 rounded-md border border-blue-100">
                            {lobby.category.replace(/[^a-zA-Z ]/g, "").trim()}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 mb-2">{lobby.description}</p>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${lobby.active ? 'bg-green-500' : 'bg-slate-300'}`}></span>
                          <span className="text-xs font-medium text-slate-600">{lobby.active ? 'Live' : 'Idle'}</span>
                        </div>
                        <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          {lobby._count?.participants || 1} members
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 items-center">
                      {isJoined && (
                        <Link 
                          to={`/lobbies/${lobby.id}`}
                          className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-center w-full sm:w-auto"
                        >
                          View
                        </Link>
                      )}
                      <button
                        onClick={() => handleJoin(lobby.id)}
                        disabled={isJoined}
                        className={`px-5 py-2 text-sm font-semibold rounded-lg transition-colors w-full sm:w-auto ${
                          isJoined 
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-default' 
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
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

        {/* ── RIGHT: Categories ──────────────────────────────────────────── */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[650px]">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Categories</h2>
                  <p className="text-sm text-slate-500 font-medium">Browse by topic</p>
                </div>
              </div>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)} 
                  className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
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
