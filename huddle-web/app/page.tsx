'use client';
import React, { useState, useEffect } from 'react';
import { lobbyService } from './services/lobbyService';
import useAuthStore from './store/authStore';
import ConfirmModal from './components/ConfirmModal';
import LobbyCard from './components/LobbyCard';
import CategoriesSidebar from './components/CategoriesSidebar';
import ProfilesList from './components/ProfilesList';

// ─── Home / Lobbies Page ──────────────────────────────────────────────────────
function Home() {
  const [search, setSearch] = useState('');
  const [lobbies, setLobbies] = useState([]);
  const [joinedLobbies, setJoinedLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [expandedComments, setExpandedComments] = useState([]);
  const [confirmModal, setConfirmModal] = useState({ open: false, targetId: null, loading: false });
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

  const handleLike = async (lobbyId) => {
    if (!user) return alert('Please log in to like a post');
    try {
      const res = await lobbyService.toggleLike(lobbyId);
      setLobbies(lobbies.map(l => {
        if (l.id === lobbyId) {
          const isLiked = res.liked;
          const currentLikesCount = l._count?.likes || 0;
          return {
            ...l,
            likes: isLiked ? [{ id: 'temp' }] : [],
            _count: { ...l._count, likes: isLiked ? currentLikesCount + 1 : Math.max(0, currentLikesCount - 1) }
          };
        }
        return l;
      }));
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  const toggleComments = (lobbyId) => {
    if (expandedComments.includes(lobbyId)) {
      setExpandedComments(expandedComments.filter(id => id !== lobbyId));
    } else {
      setExpandedComments([...expandedComments, lobbyId]);
    }
  };

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

  const handleDelete = async () => {
    const lobbyId = confirmModal.targetId;
    setConfirmModal(m => ({ ...m, loading: true }));
    try {
      await lobbyService.deleteLobby(lobbyId);
      setLobbies(lobbies.filter(l => l.id !== lobbyId));
      setConfirmModal({ open: false, targetId: null, loading: false });
    } catch (error) {
      setConfirmModal(m => ({ ...m, loading: false }));
      const msg = error?.response?.data?.error || 'Failed to end the event.';
      alert(`Error: ${msg}`);
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
    <>
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-8">
        <ProfilesList />
      </div>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ── LEFT: All Lobbies ──────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
          <div className="relative p-6 border-b border-slate-100 bg-gradient-to-br from-blue-50/50 via-white to-white overflow-hidden">
            
            <div className="relative z-10 flex flex-col mb-6">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-3xl font-extrabold text-black tracking-tight">
                  {selectedCategory ? `${selectedCategory.name} Lobbies` : 'Explore Lobbies'}
                </h2>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-inner hidden sm:block">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <polygon points="16 8 14 14 8 16 10 10 16 8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium">
                {selectedCategory ? `Showing events for ${selectedCategory.name.toLowerCase()}` : 'Find and join active communities'}
              </p>
            </div>

            <div className="relative group z-10">
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
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50/80 hover:bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-400 transition-all shadow-sm placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-x-hidden p-5 relative bg-slate-50/30">
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
                filteredLobbies.map((lobby) => (
                  <LobbyCard
                    key={lobby.id}
                    lobby={lobby}
                    user={user}
                    joinedLobbies={joinedLobbies}
                    expandedComments={expandedComments}
                    handleLike={handleLike}
                    toggleComments={toggleComments}
                    handleJoin={handleJoin}
                    setSelectedCategory={setSelectedCategory}
                    setConfirmModal={setConfirmModal}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Categories ──────────────────────────────────────────── */}
        <CategoriesSidebar 
          selectedCategory={selectedCategory} 
          setSelectedCategory={setSelectedCategory} 
        />

      </div>
    </div>

      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, targetId: null, loading: false })}
        onConfirm={handleDelete}
        loading={confirmModal.loading}
        title="End this event?"
        message="This will mark the event as ended. It will be removed from the live feed."
        confirmText="End Event"
        confirmColor="amber"
      />
    </>
  );
}

export default Home;
