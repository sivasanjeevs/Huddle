import React, { useState } from 'react';
import useAuthStore from '../store/authStore';
import { User, Mail, Camera, Save, MapPin, Briefcase, Link, Globe, Info, Star, Award } from 'lucide-react';

const Profile = () => {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  
  // New state variables
  const [workOrCollege, setWorkOrCollege] = useState(user?.workOrCollege || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interests, setInterests] = useState(user?.interests?.join(', ') || '');
  const [skills, setSkills] = useState(user?.skills?.join(', ') || '');
  const [location, setLocation] = useState(user?.location || '');
  
  const [github, setGithub] = useState(user?.socialLinks?.github || '');
  const [linkedin, setLinkedin] = useState(user?.socialLinks?.linkedin || '');
  const [twitter, setTwitter] = useState(user?.socialLinks?.twitter || '');

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const displayAvatar = avatar || `https://api.dicebear.com/9.x/glass/svg?seed=${user?.id || 'default'}`;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setMessage('Name is required.');
      return;
    }

    setIsLoading(true);
    setMessage('');
    try {
      const interestsArray = interests.split(',').map(i => i.trim()).filter(i => i);
      const skillsArray = skills.split(',').map(i => i.trim()).filter(i => i);
      const socialLinks = { github, linkedin, twitter };

      await updateProfile({ 
        name, 
        avatar, 
        workOrCollege, 
        bio, 
        interests: interestsArray, 
        skills: skillsArray, 
        location, 
        socialLinks 
      });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 py-8">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-300">
        
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
                className="w-32 h-32 rounded-full border-4 border-slate-200 object-cover bg-white"
              />
              {isEditing && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="text-slate-900 h-8 w-8" />
                </label>
              )}
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-slate-100 hover:bg-gray-600 text-slate-900 px-4 py-2 rounded-lg font-medium transition-colors"
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
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Personal Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Full Name <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          disabled={!isEditing}
                          required
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="email" 
                          value={email}
                          disabled
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 opacity-70 cursor-not-allowed transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Bio</label>
                      <div className="relative">
                        <div className="absolute top-3 left-3 pointer-events-none">
                          <Info className="h-5 w-5 text-slate-400" />
                        </div>
                        <textarea 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          disabled={!isEditing}
                          rows="3"
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                          placeholder="Tell us a bit about yourself..."
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <div>
                        <label className="block text-sm font-medium text-slate-500 mb-1">Avatar URL</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Camera className="h-5 w-5 text-slate-400" />
                          </div>
                          <input 
                            type="text" 
                            value={avatar}
                            onChange={(e) => setAvatar(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="https://example.com/avatar.png"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Location & Work</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Location</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MapPin className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                          placeholder="e.g., San Francisco, CA"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">College/Work</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Briefcase className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={workOrCollege}
                          onChange={(e) => setWorkOrCollege(e.target.value)}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                          placeholder="e.g., Stanford University or Google"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Skills & Interests</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Skills (comma separated)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Award className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={skills}
                          onChange={(e) => setSkills(e.target.value)}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                          placeholder="React, Node.js, Python"
                        />
                      </div>
                      {!isEditing && skills && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {skills.split(',').map((s, i) => s.trim() && (
                            <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-md border border-blue-500/30">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-500 mb-1">Interests (comma separated)</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Star className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={interests}
                          onChange={(e) => setInterests(e.target.value)}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                          placeholder="AI, Web3, Open Source"
                        />
                      </div>
                      {!isEditing && interests && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {interests.split(',').map((s, i) => s.trim() && (
                            <span key={i} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-md border border-purple-500/30">
                              {s.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-slate-900 mb-4">Social Links</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={github}
                          onChange={(e) => setGithub(e.target.value)}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                          placeholder="GitHub Username or URL"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={linkedin}
                          onChange={(e) => setLinkedin(e.target.value)}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                          placeholder="LinkedIn Profile URL"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-slate-400" />
                        </div>
                        <input 
                          type="text" 
                          value={twitter}
                          onChange={(e) => setTwitter(e.target.value)}
                          disabled={!isEditing}
                          className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                          placeholder="Twitter/X Handle"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>

            {isEditing && (
              <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-slate-300">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-5 py-2.5 rounded-lg font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-slate-900 rounded-lg font-medium transition-colors disabled:opacity-50"
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
