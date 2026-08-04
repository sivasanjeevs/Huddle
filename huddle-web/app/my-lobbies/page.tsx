'use client';
import React, { useState, useEffect } from 'react';
import { lobbyService } from '../services/lobbyService';
import Link from 'next/link';
import useAuthStore from '../store/authStore';
import { getDefaultAvatar } from '../utils/avatar';
import ConfirmModal from '../components/ConfirmModal';

function MyLobbies() {
  const [lobbies, setLobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, type: null, targetId: null, loading: false });
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchMyLobbies = async () => {
      try {
        const data = await lobbyService.getMyLobbies();
        setLobbies(data);
      } catch (error) {
        console.error("Failed to fetch my lobbies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyLobbies();
  }, []);

  const handleEndLobby = async () => {
    const lobbyId = confirmModal.targetId;
    setConfirmModal(m => ({ ...m, loading: true }));
    try {
      await lobbyService.deleteLobby(lobbyId);
      setLobbies(lobbies.map(l => l.id === lobbyId ? { ...l, active: false } : l));
      setConfirmModal({ open: false, type: null, targetId: null, loading: false });
    } catch (error) {
      setConfirmModal(m => ({ ...m, loading: false }));
      const msg = error?.response?.data?.error || 'Failed to end the event.';
      alert(`Error: ${msg}`);
    }
  };

  const handleHardDeleteLobby = async () => {
    const lobbyId = confirmModal.targetId;
    setConfirmModal(m => ({ ...m, loading: true }));
    try {
      await lobbyService.hardDeleteLobby(lobbyId);
      setLobbies(lobbies.filter(l => l.id !== lobbyId));
      setConfirmModal({ open: false, type: null, targetId: null, loading: false });
    } catch (error) {
      setConfirmModal(m => ({ ...m, loading: false }));
      const msg = error?.response?.data?.error || 'Failed to delete the event.';
      alert(`Error: ${msg}`);
    }
  };



  return (
    <>
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-4 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">My Lobbies</h1>
            {!loading && (
              <p className="text-slate-500 mt-1">
                Lobbies you have joined ({lobbies.filter(l => l.creatorId !== user?.id).length}) or created ({lobbies.filter(l => l.creatorId === user?.id).length})
              </p>
            )}
          </div>
          <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Explore
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : lobbies.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800">No lobbies yet</h3>
            <p className="text-slate-500 mt-2 mb-6">You haven't joined any lobbies yet.</p>
            <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors shadow-sm">
              Explore Lobbies
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lobbies.map(lobby => {
              const isCreator = user?.id === lobby.creatorId;
              return (
              <div key={lobby.id} className={`bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col ${!lobby.active ? 'opacity-75 grayscale-[0.3]' : ''}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100">
                      {lobby.category?.replace(/[^a-zA-Z ]/g, "").trim()}
                    </span>
                    <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-lg border ${lobby.active ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-100 text-slate-700 border-slate-300'}`}>
                      {lobby.active ? 'Live' : 'Completed'}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {lobby._count?.participants || 1} members
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 mb-2">{lobby.title}</h3>
                <p className="text-slate-500 text-sm mb-6 line-clamp-2">{lobby.description}</p>
                
                <div className="space-y-2.5 mb-6">
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {lobby.date} at {lobby.time}
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {lobby.location}
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img 
                        src={lobby.creator?.avatar || getDefaultAvatar(lobby.creatorId)} 
                        alt="Host" 
                        className="w-8 h-8 rounded-full border border-slate-200"
                      />
                      <div className="text-xs">
                        <p className="text-slate-400 font-medium">Hosted by</p>
                        <p className="text-slate-700 font-semibold">{isCreator ? 'You' : (lobby.creator?.name || 'User')}</p>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/lobbies/${lobby.id}`}
                      className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      View
                    </Link>
                  </div>
                  
                  {isCreator && (
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-50">
                      {lobby.active && (
                        <button
                          onClick={() => setConfirmModal({ open: true, type: 'end', targetId: lobby.id, loading: false })}
                          className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded transition-colors"
                        >
                          End Event
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmModal({ open: true, type: 'delete', targetId: lobby.id, loading: false })}
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors"
                      >
                        Delete Permanently
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === 'end'}
        onClose={() => setConfirmModal({ open: false, type: null, targetId: null, loading: false })}
        onConfirm={handleEndLobby}
        loading={confirmModal.loading}
        title="End this event?"
        message="This will mark the event as inactive. It will no longer appear in the live feed."
        confirmText="End Event"
        confirmColor="amber"
      />

      <ConfirmModal
        isOpen={confirmModal.open && confirmModal.type === 'delete'}
        onClose={() => setConfirmModal({ open: false, type: null, targetId: null, loading: false })}
        onConfirm={handleHardDeleteLobby}
        loading={confirmModal.loading}
        title="Delete permanently?"
        message="This will permanently remove the event and all its data. This action cannot be undone."
        confirmText="Delete Forever"
        confirmColor="red"
      />
    </div>
    </>
  );
}

export default MyLobbies;
