'use client';
import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { getDefaultAvatar } from '../utils/avatar';
import {
  Camera, Save, MapPin, Sparkles, Activity, Check, Briefcase, Code2,
  Link as LinkIcon, Heart, X, ChevronRight, UserPlus, Star,
  Calendar, Search, Globe, Users,
  Languages, Clock, Navigation, Edit2,
} from 'lucide-react';
import api from '../services/api';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const { user, updateProfile, fetchProfile } = useAuthStore();
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');

  const [interests, setInterests] = useState<string[]>(user?.interests || []);
  const [lookingFor, setLookingFor] = useState<string[]>(user?.lookingFor || []);

  const prefs = user?.preferences || {};
  const [languages, setLanguages] = useState<string[]>(prefs.languages || []);
  const [availability, setAvailability] = useState<string[]>(prefs.availability || []);
  const [travelRadius, setTravelRadius] = useState(prefs.travelRadius || 'Anywhere');

  const social = user?.socialLinks || {};
  const [instagram, setInstagram] = useState(social.instagram || '');
  const [github, setGithub] = useState(social.github || '');
  const [linkedin, setLinkedin] = useState(social.linkedin || '');
  const [website, setWebsite] = useState(social.website || '');

  const [newInterest, setNewInterest] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    fetchProfile();
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/lobbies');
        const allLobbies = res.data;
        const matched = allLobbies.filter((lobby: any) =>
          interests.some((interest: string) =>
            lobby.category.toLowerCase().includes(interest.toLowerCase()) ||
            lobby.title.toLowerCase().includes(interest.toLowerCase())
          )
        );
        const suggestions = matched.length >= 3 ? matched : [...matched, ...allLobbies.filter((l: any) => !matched.includes(l))].slice(0, 3);
        setAiSuggestions(suggestions);
      } catch (err) {
        console.error('Failed to fetch suggestions', err);
      }
    };
    fetchSuggestions();
  }, [interests]);

  const displayAvatar = avatar || getDefaultAvatar(user?.id);
  const username = `@${(name || 'user').toLowerCase().replace(/\s+/g, '')}`;

  const toggleArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>, array: string[], item: string) => {
    setter(array.includes(item) ? array.filter(i => i !== item) : [...array, item]);
  };

  const handleAddInterest = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newInterest.trim() && !interests.includes(newInterest.trim())) {
        setInterests([...interests, newInterest.trim()]);
        setNewInterest('');
      }
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) return setMessage('Name is required.');
    setIsLoading(true);
    setMessage('');
    try {
      await updateProfile({ name, avatar, bio, location, interests, lookingFor, preferences: { languages, availability, travelRadius }, socialLinks: { instagram, github, linkedin, website } });
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      setMessage('Failed to update profile.');
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedInterests = ['Football', 'Cricket', 'AI', 'Web Development', 'Gaming', 'Photography', 'Music', 'Movies', 'Travel', 'Startups', 'Books', 'Fitness', 'Robotics', 'Open Source'];
  const suggestedLookingFor = ['Study Partners', 'Football Team', 'Gaming Squad', 'Travel Buddies', 'Hackathon Team', 'Startup Co-founders', 'Movie Friends', 'Gym Partners', 'Photography Walks'];
  const suggestedLanguages = ['English', 'Spanish', 'French', 'German', 'Hindi', 'Mandarin', 'Japanese', 'Arabic'];
  const suggestedAvailability = ['Weekdays', 'Weekends', 'Morning', 'Evening'];
  const travelRadii = ['5 km', '10 km', '25 km', 'Anywhere'];

  const getRecentActivities = () => {
    let activities: any[] = [];
    if (user?.createdLobbies) activities = [...activities, ...user.createdLobbies.map((l: any) => ({ type: 'hosted', data: l, date: new Date(l.createdAt || Date.now()) }))];
    if (user?.participatingLobbies) activities = [...activities, ...user.participatingLobbies.map((pl: any) => ({ type: 'joined', data: pl.lobby, date: new Date(pl.joinedAt || Date.now()) }))];
    return activities.sort((a, b) => b.date - a.date).slice(0, 5);
  };
  const recentActivities = getRecentActivities();

  if (!isMounted) return null;

  // Interest tag colors cycling
  const tagColors = [
    'bg-violet-100 text-violet-700',
    'bg-blue-100 text-blue-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-cyan-100 text-cyan-700',
  ];
  const lookingColors = [
    'bg-indigo-100 text-indigo-700',
    'bg-teal-100 text-teal-700',
    'bg-rose-100 text-rose-700',
    'bg-orange-100 text-orange-700',
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      {/* ── ANIMATED GRADIENT HERO BANNER ───────────────────── */}
      <div
        className="relative h-56 sm:h-72 animate-gradient-x overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #3b82f6, #06b6d4, #6366f1)',
        }}
      >
        {/* floating orbs */}
        <div className="absolute top-6 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-4 right-16 w-52 h-52 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute top-16 right-1/3 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

        {/* Edit button top-right */}
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="absolute top-5 right-5 z-20 flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/30 rounded-xl font-semibold text-sm transition-all"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </button>
        )}
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-16 relative z-10">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT COL ─────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* IDENTITY CARD */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] p-6 sm:p-8 border border-slate-100">
              {/* Avatar row */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-5 mb-6">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full ring-4 ring-white shadow-xl overflow-hidden bg-slate-100">
                    <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                  </div>
                  {isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white h-7 w-7" />
                    </div>
                  )}
                </div>

                {/* Name / bio / stats */}
                <div className="flex-1 min-w-0">
                  {isEditing ? (
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="text-2xl sm:text-3xl font-extrabold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 w-full focus:ring-2 focus:ring-violet-400 outline-none mb-2"
                      placeholder="Your Name"
                    />
                  ) : (
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">{name}</h1>
                  )}
                  <p className="text-violet-500 font-semibold mt-0.5 mb-3">{username}</p>

                  {/* Inline stats */}
                  <div className="flex items-center gap-0">
                    {[
                      { label: 'Hosted', value: user?.createdLobbies?.length || 0, type: 'hosted' },
                      { label: 'Followers', value: user?.followers?.length || 0, type: 'followers' },
                      { label: 'Following', value: user?.following?.length || 0, type: 'following' },
                    ].map((stat, i) => (
                      <React.Fragment key={stat.type}>
                        {i > 0 && <div className="w-px h-8 bg-slate-200 mx-1" />}
                        <button
                          onClick={() => { setModalType(stat.type); setModalOpen(true); }}
                          className="px-3 sm:px-4 py-1 text-center hover:bg-slate-50 rounded-xl transition-colors group"
                        >
                          <div className="text-xl font-bold text-slate-800">{stat.value}</div>
                          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide group-hover:text-violet-500 transition-colors">{stat.label}</div>
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message */}
              {message && (
                <div className={`p-3 rounded-xl mb-5 flex items-center gap-2 text-sm ${message.includes('success') ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                  {message.includes('success') ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                  {message}
                </div>
              )}

              {/* Bio / Location */}
              {isEditing ? (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      className="flex-1 text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-violet-400 outline-none"
                      placeholder="Where are you based?"
                    />
                  </div>
                  <textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    rows={2}
                    className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-violet-400 outline-none resize-none"
                    placeholder="Write a short, fun bio..."
                  />
                  <input
                    type="text"
                    value={avatar}
                    onChange={e => setAvatar(e.target.value)}
                    className="w-full text-sm text-slate-600 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-violet-400 outline-none"
                    placeholder="Avatar URL (optional)"
                  />
                </div>
              ) : (
                <div className="mb-6 space-y-2">
                  {location && (
                    <p className="flex items-center gap-1.5 text-sm text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {location}
                    </p>
                  )}
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {bio || 'Just exploring the world, one huddle at a time! 🚀'}
                  </p>
                </div>
              )}

              {/* Social links */}
              <div className="pt-5 border-t border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <LinkIcon className="w-3 h-3" /> Social Links
                </p>
                {isEditing ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { value: instagram, setter: setInstagram, icon: <Camera className="w-4 h-4" />, placeholder: 'Instagram URL' },
                      { value: github, setter: setGithub, icon: <Code2 className="w-4 h-4" />, placeholder: 'GitHub URL' },
                      { value: linkedin, setter: setLinkedin, icon: <Briefcase className="w-4 h-4" />, placeholder: 'LinkedIn URL' },
                      { value: website, setter: setWebsite, icon: <Globe className="w-4 h-4" />, placeholder: 'Website URL' },
                    ].map((field, i) => (
                      <div key={i} className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400">{field.icon}</span>
                        <input
                          type="text"
                          value={field.value}
                          onChange={e => field.setter(e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-violet-400 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-5">
                    {instagram && <a href={instagram} target="_blank" rel="noreferrer" title="Instagram" className="text-slate-500 hover:text-slate-900 transition-colors"><Camera className="w-5 h-5" /></a>}
                    {github && <a href={github} target="_blank" rel="noreferrer" title="GitHub" className="text-slate-500 hover:text-slate-900 transition-colors"><Code2 className="w-5 h-5" /></a>}
                    {linkedin && <a href={linkedin} target="_blank" rel="noreferrer" title="LinkedIn" className="text-slate-500 hover:text-slate-900 transition-colors"><Briefcase className="w-5 h-5" /></a>}
                    {website && <a href={website} target="_blank" rel="noreferrer" title="Website" className="text-slate-500 hover:text-slate-900 transition-colors"><Globe className="w-5 h-5" /></a>}
                    {!instagram && !github && !linkedin && !website && (
                      <span className="text-sm text-slate-400 italic">No links added yet</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* PREFERENCES CARD */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] p-6 sm:p-8 border border-slate-100">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5" /> Preferences
              </h2>
              {isEditing ? (
                <div className="space-y-5">
                  {[
                    { label: 'Languages', icon: <Languages className="w-3.5 h-3.5 text-violet-400" />, items: suggestedLanguages, selected: languages, setter: setLanguages },
                    { label: 'Availability', icon: <Clock className="w-3.5 h-3.5 text-violet-400" />, items: suggestedAvailability, selected: availability, setter: setAvailability },
                  ].map(pref => (
                    <div key={pref.label}>
                      <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">{pref.icon}{pref.label}</p>
                      <div className="flex flex-wrap gap-2">
                        {pref.items.map(item => {
                          const sel = pref.selected.includes(item);
                          return (
                            <button key={item} type="button" onClick={() => toggleArrayItem(pref.setter, pref.selected, item)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${sel ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                              {sel && <Check className="w-3 h-3 inline mr-1" />}{item}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-violet-400" />Travel Radius</p>
                    <div className="flex flex-wrap gap-2">
                      {travelRadii.map(item => (
                        <button key={item} type="button" onClick={() => setTravelRadius(item)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${travelRadius === item ? 'bg-violet-600 text-white border-violet-600' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-violet-300'}`}>
                          {travelRadius === item && <Check className="w-3 h-3 inline mr-1" />}{item}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Languages className="w-4 h-4 text-violet-400 shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {languages.length > 0 ? languages.map(l => <span key={l} className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 rounded-full">{l}</span>) : <span className="text-sm text-slate-400">—</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-violet-400 shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {availability.length > 0 ? availability.map(a => <span key={a} className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 rounded-full">{a}</span>) : <span className="text-sm text-slate-400">—</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Navigation className="w-4 h-4 text-violet-400 shrink-0" />
                    {travelRadius ? <span className="px-2.5 py-1 text-xs font-medium bg-violet-50 text-violet-700 rounded-full">{travelRadius}</span> : <span className="text-sm text-slate-400">—</span>}
                  </div>
                </div>
              )}
            </div>

            {/* INTERESTS CARD */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] p-6 sm:p-8 border border-slate-100">
              <div className="flex items-center gap-2 mb-5">
                <Heart className="w-4 h-4 text-pink-500" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Interests &amp; Hobbies</h2>
              </div>

              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {suggestedInterests.map(item => {
                    const sel = interests.includes(item);
                    return (
                      <button key={item} type="button" onClick={() => toggleArrayItem(setInterests, interests, item)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${sel ? 'bg-pink-500 text-white border-pink-500' : 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100'}`}>
                        {sel && <Check className="w-3.5 h-3.5 inline mr-1" />}{item}
                      </button>
                    );
                  })}
                  {interests.filter(i => !suggestedInterests.includes(i)).map(item => (
                    <button key={item} type="button" onClick={() => toggleArrayItem(setInterests, interests, item)}
                      className="px-3.5 py-1.5 rounded-full text-sm font-medium border bg-pink-500 text-white border-pink-500">
                      <Check className="w-3.5 h-3.5 inline mr-1" />{item}
                    </button>
                  ))}
                  <div className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={newInterest}
                      onChange={e => setNewInterest(e.target.value)}
                      onKeyDown={handleAddInterest}
                      placeholder="Add custom…"
                      className="bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 text-sm w-32 outline-none focus:border-pink-300"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {interests.length > 0
                    ? interests.map((item, i) => (
                        <span key={item} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${tagColors[i % tagColors.length]}`}>{item}</span>
                      ))
                    : <span className="text-sm text-slate-400 italic">No interests selected yet — edit your profile to add some!</span>
                  }
                </div>
              )}

              <div className="h-px bg-slate-100 my-6" />

              <div className="flex items-center gap-2 mb-5">
                <Search className="w-4 h-4 text-blue-500" />
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider">I'm Looking For</h2>
              </div>

              {isEditing ? (
                <div className="flex flex-wrap gap-2">
                  {suggestedLookingFor.map(item => {
                    const sel = lookingFor.includes(item);
                    return (
                      <button key={item} type="button" onClick={() => toggleArrayItem(setLookingFor, lookingFor, item)}
                        className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all ${sel ? 'bg-blue-600 text-white border-blue-600' : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100'}`}>
                        {sel && <Check className="w-3.5 h-3.5 inline mr-1" />}{item}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {lookingFor.length > 0
                    ? lookingFor.map((item, i) => (
                        <span key={item} className={`px-3.5 py-1.5 rounded-full text-sm font-semibold ${lookingColors[i % lookingColors.length]}`}>{item}</span>
                      ))
                    : <span className="text-sm text-slate-400 italic">Nothing selected yet</span>
                  }
                </div>
              )}
            </div>

          </div>

          {/* ── RIGHT COL ─────────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">

            {/* AI SUGGESTIONS */}
            <div className="bg-gradient-to-br from-blue-50 to-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] p-6 border border-blue-100 relative overflow-hidden">
              <div className="relative z-10 mb-5">
                <h3 className="text-lg font-bold flex items-center gap-2 text-slate-800">
                  <Sparkles className="w-5 h-5 text-blue-500" /> AI Suggestions
                </h3>
                <p className="text-slate-500 text-sm mt-1">Based on your interests</p>
              </div>
              <div className="space-y-3 relative z-10">
                {aiSuggestions.length > 0 ? aiSuggestions.map((lobby: any) => (
                  <div
                    key={lobby.id}
                    onClick={() => navigate(`/lobby/${lobby.id}`)}
                    className="bg-white rounded-2xl p-4 border border-blue-50 hover:border-blue-200 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <h4 className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{lobby.title}</h4>
                    <p className="text-sm text-slate-500 mt-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" /> {lobby.date} at {lobby.time}
                    </p>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic">No suggestions right now.</p>
                )}
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.07)] p-6 border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-5 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-500" /> Recent Activity
              </h2>
              <div className="space-y-5">
                {recentActivities.length > 0 ? recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-slate-100 flex items-center justify-center border border-slate-200">
                      {activity.type === 'hosted' ? <Star className="w-4 h-4 text-amber-500" /> : <UserPlus className="w-4 h-4 text-blue-500" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{activity.type === 'hosted' ? 'Hosted' : 'Joined'} {activity.data?.title || 'an activity'}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{activity.data?.category}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-sm text-slate-500 italic">No recent activities.</p>
                )}
              </div>
              {recentActivities.length > 0 && (
                <button className="w-full mt-5 py-2.5 px-4 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 font-semibold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-100">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* ── FLOATING SAVE BAR ────────────────────────────────── */}
      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-4 py-4 flex justify-center animate-fade-in">
          <div className="w-full max-w-6xl flex items-center justify-between gap-4">
            <p className="text-slate-500 font-medium text-sm hidden sm:block">You have unsaved changes</p>
            <div className="flex gap-3 w-full sm:w-auto">
              <button onClick={() => setIsEditing(false)} className="flex-1 sm:flex-none px-6 py-2.5 rounded-2xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95">
                Cancel
              </button>
              <button onClick={handleSave} disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl font-bold transition-all shadow-[0_4px_12px_rgba(124,58,237,0.4)] disabled:opacity-50 active:scale-95">
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving…' : 'Save Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL ─────────────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-800 capitalize">{modalType}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <div className="p-3 max-h-[60vh] overflow-y-auto">
              {modalType === 'hosted' && (
                <div className="space-y-1">
                  {(user?.createdLobbies?.length ?? 0) > 0 ? user!.createdLobbies!.map((lobby: any) => (
                    <div key={lobby.id} onClick={() => { setModalOpen(false); navigate(`/lobby/${lobby.id}`); }}
                      className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-bold shrink-0">
                        {lobby.coverImage ? <img src={lobby.coverImage} className="w-full h-full object-cover rounded-xl" alt="" /> : lobby.title.charAt(0)}
                      </div>
                      <div><h4 className="font-bold text-slate-800 text-sm line-clamp-1">{lobby.title}</h4><p className="text-xs text-slate-500">{lobby.date}</p></div>
                    </div>
                  )) : <p className="text-slate-500 text-center p-6 italic text-sm">No hosted events yet.</p>}
                </div>
              )}
              {['followers', 'following'].includes(modalType) && (
                <div className="space-y-1">
                  {((modalType === 'followers' ? user?.followers : user?.following)?.length ?? 0) > 0
                    ? (modalType === 'followers' ? user!.followers! : user!.following!).map((f: any) => (
                        <div key={f.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl cursor-pointer transition-colors">
                          <img src={f.avatar || getDefaultAvatar(f.id)} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt={f.name} />
                          <h4 className="font-bold text-slate-800 text-sm">{f.name}</h4>
                        </div>
                      ))
                    : <p className="text-slate-500 text-center p-6 italic text-sm">{modalType === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'}</p>}
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
