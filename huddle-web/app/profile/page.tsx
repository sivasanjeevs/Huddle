'use client';
import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getDefaultAvatar } from '../utils/avatar';
import { Camera, Save, MapPin, Sparkles, Activity, Check, Briefcase, Terminal, Link as LinkIcon, Heart, X, ChevronRight, UserPlus, Star, Map, MessageCircle, Calendar, Search, Globe, Users } from 'lucide-react';
import api from '../services/api';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { user, updateProfile, fetchProfile } = useAuthStore();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Hero Fields
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');

  // Arrays
  const [interests, setInterests] = useState(user?.interests || []);
  const [lookingFor, setLookingFor] = useState(user?.lookingFor || []);

  // JSON preferences
  const prefs = user?.preferences || {};
  const [languages, setLanguages] = useState(prefs.languages || []);
  const [availability, setAvailability] = useState(prefs.availability || []);
  const [travelRadius, setTravelRadius] = useState(prefs.travelRadius || 'Anywhere');

  // JSON social links
  const social = user?.socialLinks || {};
  const [instagram, setInstagram] = useState(social.instagram || '');
  const [github, setGithub] = useState(social.github || '');
  const [linkedin, setLinkedin] = useState(social.linkedin || '');
  const [website, setWebsite] = useState(social.website || '');

  // Add custom interest
  const [newInterest, setNewInterest] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'hosted', 'followers', 'following'
  
  // AI Suggestions
  const [aiSuggestions, setAiSuggestions] = useState([]);

  useEffect(() => {
    fetchProfile();
    // Fetch global lobbies to filter for AI suggestions
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/lobbies');
        const allLobbies = res.data;
        const matched = allLobbies.filter(lobby => 
          interests.some(interest => lobby.category.toLowerCase().includes(interest.toLowerCase()) || 
                                     lobby.title.toLowerCase().includes(interest.toLowerCase()))
        );
        const suggestions = matched.length >= 3 ? matched : [...matched, ...allLobbies.filter(l => !matched.includes(l))].slice(0, 3);
        setAiSuggestions(suggestions);
      } catch (err) {
        console.error("Failed to fetch suggestions", err);
      }
    };
    fetchSuggestions();
  }, [interests]);

  const displayAvatar = avatar || getDefaultAvatar(user?.id);
  const username = `@${(name || 'user').toLowerCase().replace(/\s+/g, '')}`;

  const toggleArrayItem = (setter, array, item) => {
    if (array.includes(item)) {
      setter(array.filter((i) => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  const handleAddInterest = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newInterest.trim() && !interests.includes(newInterest.trim())) {
        setInterests([...interests, newInterest.trim()]);
        setNewInterest('');
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setMessage('Name is required.');

    setIsLoading(true);
    setMessage('');
    try {
      await updateProfile({ 
        name, 
        avatar, 
        bio, 
        location,
        interests,
        lookingFor,
        preferences: { languages, availability, travelRadius },
        socialLinks: { instagram, github, linkedin, website }
      });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  // Predefined lists
  const suggestedInterests = ["Football", "Cricket", "AI", "Web Development", "Gaming", "Photography", "Music", "Movies", "Travel", "Startups", "Books", "Fitness", "Robotics", "Open Source"];
  const suggestedLookingFor = ["Study Partners", "Football Team", "Gaming Squad", "Travel Buddies", "Hackathon Team", "Startup Co-founders", "Movie Friends", "Gym Partners", "Photography Walks"];
  const suggestedLanguages = ["English", "Spanish", "French", "German", "Hindi", "Mandarin", "Japanese", "Arabic"];
  const suggestedAvailability = ["Weekdays", "Weekends", "Morning", "Evening"];
  const travelRadii = ["5 km", "10 km", "25 km", "Anywhere"];

  // Render a chip
  const renderChip = (label, isSelected, onClick, colorClass = "bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20") => {
    const selectedClass = isSelected 
      ? "bg-blue-600 text-white border-blue-600 shadow-[0_4px_12px_-2px_rgba(37,99,235,0.3)]" 
      : colorClass;
      
    return (
      <button
        type="button"
        disabled={!isEditing}
        onClick={onClick}
        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 border flex items-center gap-1.5 cursor-pointer ${selectedClass} ${!isEditing ? 'opacity-80 cursor-default' : 'hover:-translate-y-0.5'}`}
      >
        {isSelected && <Check className="w-3.5 h-3.5" />}
        {label}
      </button>
    );
  };

  const getRecentActivities = () => {
    let activities = [];
    if (user?.createdLobbies) {
      activities = [...activities, ...user.createdLobbies.map(l => ({ type: 'hosted', data: l, date: new Date(l.createdAt || Date.now()) }))];
    }
    if (user?.participatingLobbies) {
      activities = [...activities, ...user.participatingLobbies.map(pl => ({ type: 'joined', data: pl.lobby, date: new Date(pl.joinedAt || Date.now()) }))];
    }
    return activities.sort((a, b) => b.date - a.date).slice(0, 5);
  };

  const recentActivities = getRecentActivities();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Profile */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* HERO SECTION */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-slate-100">
            {/* Cover Banner */}
            <div className="h-48 sm:h-56 bg-gradient-to-r from-blue-50 via-white to-blue-50 relative border-b border-slate-100">
              <div className="absolute top-0 right-0 p-6 flex gap-3 z-10">
                {!isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 shadow-sm"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
            
            {/* Avatar & Basic Info */}
            <div className="px-6 sm:px-10 pb-10 relative">
              <div className="relative -mt-20 mb-6 flex justify-between items-end">
                <div className="relative group">
                  <div className="p-1.5 bg-white rounded-full shadow-lg">
                    <img 
                      src={displayAvatar} 
                      alt="Avatar" 
                      className="w-36 h-36 rounded-full object-cover bg-slate-50 border border-slate-100"
                    />
                  </div>
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity m-1.5">
                      <Camera className="text-white h-8 w-8" />
                    </div>
                  )}
                </div>
              </div>

              {message && (
                <div className={`p-4 rounded-xl mb-6 flex items-center gap-3 ${message.includes('success') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.includes('success') ? <Check className="w-5 h-5 text-green-500"/> : <X className="w-5 h-5 text-red-500"/>}
                  <span className="font-medium">{message}</span>
                </div>
              )}

              <form onSubmit={handleSave}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 space-y-4 w-full">
                    <div>
                      {isEditing ? (
                        <input 
                          type="text" 
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="text-3xl font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-400 focus:bg-white outline-none transition-all"
                          placeholder="Your Name"
                        />
                      ) : (
                        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">{name}</h1>
                      )}
                      <p className="text-blue-600 font-medium text-lg mt-1">{username}</p>
                    </div>

                    {isEditing ? (
                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="flex items-center gap-2 text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Where are you located?"
                        />
                        <textarea 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows="2"
                          className="text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 w-full focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                          placeholder="Write a short, fun bio..."
                        />
                        <input 
                          type="text" 
                          value={avatar}
                          onChange={(e) => setAvatar(e.target.value)}
                          className="text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Avatar URL (Optional)"
                        />
                      </div>
                    ) : (
                      <>
                        <p className="flex items-center gap-2 text-slate-500 font-medium">
                          <MapPin className="w-4 h-4" /> {location || 'Earth'}
                        </p>
                        <p className="text-slate-600 text-base leading-relaxed max-w-xl">
                          {bio || 'Just exploring the world, one huddle at a time! 🚀'}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Quick Stats */}
                  <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm shrink-0">
                    <div 
                      className="text-center px-4 border-r border-slate-200 last:border-0 cursor-pointer hover:bg-slate-200 rounded-lg transition-colors"
                      onClick={() => { setModalType('hosted'); setModalOpen(true); }}
                    >
                      <span className="block text-2xl font-bold text-slate-800">{user?.createdLobbies?.length || 0}</span>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hosted</span>
                    </div>
                    <div 
                      className="text-center px-4 border-r border-slate-200 last:border-0 cursor-pointer hover:bg-slate-200 rounded-lg transition-colors"
                      onClick={() => { setModalType('followers'); setModalOpen(true); }}
                    >
                      <span className="block text-2xl font-bold text-slate-800">{user?.followers?.length || 0}</span>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Followers</span>
                    </div>
                    <div 
                      className="text-center px-4 cursor-pointer hover:bg-slate-200 rounded-lg transition-colors"
                      onClick={() => { setModalType('following'); setModalOpen(true); }}
                    >
                      <span className="block text-2xl font-bold text-slate-800">{user?.following?.length || 0}</span>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Following</span>
                    </div>
                  </div>
                </div>

                {/* PREFERENCES & SOCIAL LINKS (Moved here) */}
                <div className="mt-8 pt-8 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Preferences */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Map className="w-4 h-4 text-orange-500" /> 
                      Preferences
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Languages</label>
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? suggestedLanguages.map(item => 
                            renderChip(item, languages.includes(item), () => toggleArrayItem(setLanguages, languages, item), "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100")
                          ) : languages.map(item => 
                            renderChip(item, true, () => {}, "bg-slate-50 text-slate-600 border-slate-200 cursor-default")
                          )}
                          {!isEditing && languages.length === 0 && <span className="text-sm text-slate-400">Not specified</span>}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Availability</label>
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? suggestedAvailability.map(item => 
                            renderChip(item, availability.includes(item), () => toggleArrayItem(setAvailability, availability, item), "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100")
                          ) : availability.map(item => 
                            renderChip(item, true, () => {}, "bg-slate-50 text-slate-600 border-slate-200 cursor-default")
                          )}
                          {!isEditing && availability.length === 0 && <span className="text-sm text-slate-400">Not specified</span>}
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Travel Radius</label>
                        <div className="flex flex-wrap gap-2">
                          {isEditing ? travelRadii.map(item => 
                            renderChip(item, travelRadius === item, () => setTravelRadius(item), "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100")
                          ) : (
                            travelRadius ? renderChip(travelRadius, true, () => {}, "bg-slate-50 text-slate-600 border-slate-200 cursor-default") : <span className="text-sm text-slate-400">Not specified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Social Links */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <LinkIcon className="w-4 h-4 text-blue-500" /> 
                      Social Links
                    </h3>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Camera className="h-4 w-4 text-slate-400 group-focus-within:text-pink-500 transition-colors" />
                          </div>
                          <input 
                            type="text" 
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-400 focus:bg-white transition-all"
                            placeholder="Instagram URL"
                          />
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Terminal className="h-4 w-4 text-slate-400 group-focus-within:text-slate-800 transition-colors" />
                          </div>
                          <input 
                            type="text" 
                            value={github}
                            onChange={(e) => setGithub(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500/20 focus:border-slate-400 focus:bg-white transition-all"
                            placeholder="GitHub URL"
                          />
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Briefcase className="h-4 w-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                          </div>
                          <input 
                            type="text" 
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 focus:bg-white transition-all"
                            placeholder="LinkedIn URL"
                          />
                        </div>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Globe className="h-4 w-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                          </div>
                          <input 
                            type="text" 
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 focus:bg-white transition-all"
                            placeholder="Personal Website URL"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-4">
                        {instagram && (
                          <a href={instagram} target="_blank" rel="noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-pink-50 text-pink-500 hover:bg-pink-100 transition-colors">
                            <Camera className="w-6 h-6" />
                          </a>
                        )}
                        {github && (
                          <a href={github} target="_blank" rel="noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                            <Terminal className="w-6 h-6" />
                          </a>
                        )}
                        {linkedin && (
                          <a href={linkedin} target="_blank" rel="noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors">
                            <Briefcase className="w-6 h-6" />
                          </a>
                        )}
                        {website && (
                          <a href={website} target="_blank" rel="noreferrer" className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors">
                            <Globe className="w-6 h-6" />
                          </a>
                        )}
                        {!instagram && !github && !linkedin && !website && (
                          <span className="text-sm text-slate-400">No social links added</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="hidden">
                    {/* Placeholder for form submission when editing hero */}
                    <button type="submit" id="save-profile-hidden">Save</button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* INTERESTS & LOOKING FOR */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Heart className="w-6 h-6 text-pink-500 p-1 bg-pink-50 rounded-lg" /> 
              Interests & Hobbies
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {suggestedInterests.map(item => 
                renderChip(item, interests.includes(item), () => toggleArrayItem(setInterests, interests, item), "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100")
              )}
              {interests.filter(i => !suggestedInterests.includes(i)).map(item => 
                renderChip(item, true, () => toggleArrayItem(setInterests, interests, item), "bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100")
              )}
              {isEditing && (
                <div className="flex items-center gap-2 px-1">
                  <input 
                    type="text" 
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyDown={handleAddInterest}
                    placeholder="Add custom..."
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm w-36 outline-none focus:border-pink-300 focus:ring-2 focus:ring-pink-100"
                  />
                </div>
              )}
            </div>

            <div className="h-px bg-slate-100 w-full my-8"></div>

            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <Search className="w-6 h-6 text-blue-500 p-1 bg-blue-50 rounded-lg" /> 
              I'm Looking For
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {suggestedLookingFor.map(item => 
                renderChip(item, lookingFor.includes(item), () => toggleArrayItem(setLookingFor, lookingFor, item))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: AI & Activity */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* AI SUGGESTIONS */}
          <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-blue-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                  <Sparkles className="w-5 h-5 text-blue-500" />
                  AI Suggestions
                </h3>
                <p className="text-slate-500 text-sm mt-1">Based on your interests</p>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              {aiSuggestions.length > 0 ? aiSuggestions.map(lobby => (
                <div 
                  key={lobby.id} 
                  onClick={() => navigate(`/lobby/${lobby.id}`)}
                  className="bg-white rounded-2xl p-4 border border-blue-50 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{lobby.title}</h4>
                  <p className="text-sm text-slate-500 mt-2 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> {lobby.date} at {lobby.time}</p>
                </div>
              )) : (
                <p className="text-sm text-slate-500 italic">No suggestions right now.</p>
              )}
            </div>
          </div>

          {/* ACTIVITY */}
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" /> 
              Recent Activity
            </h2>
            
            <div className="space-y-6">
              {recentActivities.length > 0 ? recentActivities.map((activity, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center border border-blue-100/50 shadow-sm">
                    {activity.type === 'hosted' ? <Star className="w-6 h-6 fill-blue-500/20" /> : <UserPlus className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">{activity.type === 'hosted' ? 'Hosted' : 'Joined'} {activity.data?.title || 'an activity'}</h4>
                    <p className="text-sm text-slate-500">{activity.data?.category}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500 italic">No recent activities.</p>
              )}
            </div>
            
            {recentActivities.length > 0 && (
              <button className="w-full mt-6 py-3 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold transition-colors flex items-center justify-center gap-2 text-sm border border-slate-200/50">
                View All Activity <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* SAVE FLOATING BAR */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-white/80 backdrop-blur-xl border-t border-slate-200 z-50 animate-fade-in flex justify-center">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-2 sm:px-6">
            <p className="text-slate-600 font-medium hidden sm:block">You have unsaved changes</p>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 sm:flex-none px-6 py-3 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 sm:flex-none flex justify-center items-center px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] disabled:opacity-50 active:scale-95"
              >
                <Save className="h-5 w-5 mr-2" />
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODAL FOR STATS */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in relative border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-xl text-slate-800 capitalize">{modalType}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-2 max-h-[60vh] overflow-y-auto">
              {modalType === 'hosted' && (
                <div className="space-y-1 p-2">
                  {user?.createdLobbies?.length > 0 ? user.createdLobbies.map(lobby => (
                    <div key={lobby.id} onClick={() => { setModalOpen(false); navigate(`/lobby/${lobby.id}`); }} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center text-blue-500 font-bold border border-blue-100">
                        {lobby.coverImage ? <img src={lobby.coverImage} className="w-full h-full object-cover" alt="" /> : lobby.title.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 line-clamp-1">{lobby.title}</h4>
                        <p className="text-sm text-slate-500">{lobby.date}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-center p-6 italic">No hosted events yet.</p>
                  )}
                </div>
              )}
              {modalType === 'followers' && (
                <div className="space-y-1 p-2">
                  {user?.followers?.length > 0 ? user.followers.map(f => (
                    <div key={f.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                      <img src={f.avatar || getDefaultAvatar(f.id)} className="w-12 h-12 rounded-full object-cover border border-slate-200" alt={f.name} />
                      <div>
                        <h4 className="font-bold text-slate-800">{f.name}</h4>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-center p-6 italic">No followers yet.</p>
                  )}
                </div>
              )}
              {modalType === 'following' && (
                <div className="space-y-1 p-2">
                  {user?.following?.length > 0 ? user.following.map(f => (
                    <div key={f.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors border border-transparent hover:border-slate-100">
                      <img src={f.avatar || getDefaultAvatar(f.id)} className="w-12 h-12 rounded-full object-cover border border-slate-200" alt={f.name} />
                      <div>
                        <h4 className="font-bold text-slate-800">{f.name}</h4>
                      </div>
                    </div>
                  )) : (
                    <p className="text-slate-500 text-center p-6 italic">Not following anyone yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Profile;
