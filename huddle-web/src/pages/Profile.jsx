import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { User, Mail, Camera, Save } from 'lucide-react';
import api from '../services/api';

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Example avatar generation via dicebear for visual flair if no avatar exists
  const displayAvatar = avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${user?.id || 'default'}`;

  const handleSave = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    try {
      await updateProfile({ name, avatar });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-700">
        
        {/* Cover Image / Banner */}
        <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative">
          <div className="absolute inset-0 bg-black/20"></div>
        </div>
        
        <div className="px-8 pb-8 relative">
          {/* Avatar Section */}
          <div className="relative -mt-16 mb-6 flex justify-between items-end">
            <div className="relative group">
              <img 
                src={displayAvatar} 
                alt="Profile Avatar" 
                className="w-32 h-32 rounded-full border-4 border-gray-800 object-cover bg-gray-900"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-white h-8 w-8" />
                  {/* Real app would have file input here, for now we just use text URL input below */}
                </label>
              )}
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {message && (
            <div className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-500/10 text-green-400 border border-green-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Personal Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-500" />
                        </div>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-500" />
                        </div>
                        <input 
                          type="email" 
                          value={email}
                          disabled
                          className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-70 cursor-not-allowed transition-all"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed.</p>
                    </div>

                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Avatar URL</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Camera className="h-5 w-5 text-gray-500" />
                          </div>
                          <input 
                            type="text" 
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-gray-700 rounded-xl bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="https://example.com/avatar.png"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Account Statistics</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <p className="text-gray-400 text-sm">Joined</p>
                      <p className="text-white font-medium mt-1">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                      </p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-xl border border-gray-700">
                      <p className="text-gray-400 text-sm">Auth Method</p>
                      <p className="text-white font-medium mt-1 capitalize">
                        {user?.googleId ? 'Google' : 'Email'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-lg font-medium text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>

        </div>
      </div>
    </div>
  );
};

export default Profile;
