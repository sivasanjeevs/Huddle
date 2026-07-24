import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import useAuthStore from './store/authStore';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';

// Shared Layout Component for Navigation
const Layout = ({ children }) => {
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <header className="w-full bg-white/80 backdrop-blur-md p-4 sticky top-0 z-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Huddle
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-slate-700 hover:text-slate-900 transition-colors text-sm font-medium">Lobbies</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-2 group">
                  <img 
                    src={user?.avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${user?.id || 'default'}`} 
                    alt="avatar" 
                    className="w-8 h-8 rounded-full border border-slate-300 group-hover:border-blue-400 transition-colors bg-white"
                  />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                    {user?.name || 'Profile'}
                  </span>
                </Link>
                <button 
                  onClick={logout}
                  className="text-slate-500 hover:text-red-400 transition-colors text-sm font-medium"
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Link to="/login" className="text-slate-700 hover:text-slate-900 px-4 py-2 text-sm font-medium transition-colors">
                  Log in
                </Link>
                <Link to="/signup" className="bg-blue-600 hover:bg-blue-500 text-slate-900 px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </nav>
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
