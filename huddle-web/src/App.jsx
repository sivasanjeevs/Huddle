import React, { useState, useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import CreateLobby from './pages/CreateLobby';
import MyLobbies from './pages/MyLobbies';
import LobbyWorkspace from './pages/LobbyWorkspace';

// Shared Layout Component for Navigation
const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="Huddle"
              className="h-10 w-auto object-contain"
            />
          </Link>

          {/* Right nav */}
          {isAuthenticated ? (
            <nav className="flex items-center gap-6">
              {/* Lobbies */}
              <Link
                to="/"
                className="text-slate-600 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Lobbies
              </Link>

              {/* Create Lobby */}
              <Link
                to="/create-lobby"
                className="flex items-center gap-1.5 bg-blue-600/70 backdrop-blur-md border border-blue-400/50 hover:bg-blue-600/90 hover:border-blue-300 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.3)] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create Lobby
              </Link>

              {/* Profile dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  id="profile-menu-btn"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 group focus:outline-none"
                >
                  <img
                    src={user?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${user?.id || 'default'}`}
                    alt="avatar"
                    className="w-9 h-9 rounded-full border-2 border-slate-200 group-hover:border-blue-400 transition-colors bg-white shadow-sm"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {user?.name || 'Profile'}
                  </span>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 animate-fade-in">
             
                    <Link
                      to="/my-lobbies"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      My Lobbies
                    </Link>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </Link>
                    <div className="border-t border-slate-100 mt-1">
                      <button
                        id="logout-btn"
                        onClick={() => { setProfileOpen(false); logout(); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </nav>
          ) : (
            <nav className="flex items-center gap-3">
              <Link to="/login" className="text-slate-700 hover:text-slate-900 px-4 py-2 text-sm font-medium transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors">
                Sign up
              </Link>
            </nav>
          )}
        </div>
      </header>

      <main className="w-full flex-1">
        {children}
      </main>
    </div>
  );
};

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        
        {/* Routes with Layout */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Layout>
                <Home />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/create-lobby" 
          element={
            <ProtectedRoute>
              <Layout>
                <CreateLobby />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/lobbies/:id" 
          element={
            <ProtectedRoute>
              <Layout>
                <LobbyWorkspace />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-lobbies" 
          element={
            <ProtectedRoute>
              <Layout>
                <MyLobbies />
              </Layout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Layout>
                <Profile />
              </Layout>
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
