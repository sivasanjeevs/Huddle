'use client';
import React, { useState } from 'react';
import { useNavigate } from '@/app/hooks/useNavigate';
import { lobbyService } from '../services/lobbyService';
import { aiService } from '../services/aiService';

// ── Confetti burst utility ─────────────────────────────────────────
const CONFETTI_COLORS = ['#6366f1','#8b5cf6','#3b82f6','#06b6d4','#10b981','#f59e0b','#ec4899'];
function fireConfetti() {
  const count = 60;
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = `${Math.random() * 100}vw`;
    el.style.width = `${6 + Math.random() * 8}px`;
    el.style.height = `${6 + Math.random() * 8}px`;
    el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    el.style.animationDuration = `${0.8 + Math.random() * 1.4}s`;
    el.style.animationDelay = `${Math.random() * 0.4}s`;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

const CATEGORIES = [
  {
    name: 'Sports',
    fields: [
      { name: 'sportType', label: 'Sport Type', type: 'text', placeholder: 'e.g. Football' },
      { name: 'skillLevel', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'equipmentNeeded', label: 'Equipment Needed', type: 'text', placeholder: 'e.g. Bring Shoes' },
      { name: 'groundVenue', label: 'Ground / Venue', type: 'text', placeholder: 'e.g. PSG Ground' },
      { name: 'entryFee', label: 'Entry Fee', type: 'text', placeholder: 'e.g. Free or $10' },
      { name: 'teamSize', label: 'Team Size', type: 'number', placeholder: 'e.g. 10' }
    ]
  },
  {
    name: 'Technology',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. React Workshop' },
      { name: 'experienceLevel', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'mode', label: 'Mode', type: 'select', options: ['Online', 'Offline', 'Hybrid'] },
      { name: 'techStack', label: 'Tech Stack', type: 'text', placeholder: 'e.g. React + Tailwind' },
      { name: 'requirements', label: 'Requirements', type: 'text', placeholder: 'e.g. Laptop Required' }
    ]
  },
  {
    name: 'Education',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'level', label: 'Level', type: 'text' },
      { name: 'materialsNeeded', label: 'Materials Needed', type: 'text' },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'instructor', label: 'Instructor (optional)', type: 'text', required: false }
    ]
  },
  {
    name: 'Business',
    fields: [
      { name: 'meetingType', label: 'Meeting Type', type: 'text' },
      { name: 'industry', label: 'Industry', type: 'text' },
      { name: 'targetAudience', label: 'Target Audience', type: 'text' },
      { name: 'dressCode', label: 'Dress Code (optional)', type: 'text', required: false }
    ]
  },
  {
    name: 'Design',
    fields: [
      { name: 'designTool', label: 'Design Tool', type: 'text' },
      { name: 'skillLevel', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'materialsNeeded', label: 'Materials Needed', type: 'text' }
    ]
  },
  {
    name: 'Gaming',
    fields: [
      { name: 'game', label: 'Game', type: 'text', placeholder: 'e.g. Valorant' },
      { name: 'platform', label: 'Platform', type: 'text', placeholder: 'e.g. PC, PS5' },
      { name: 'rankRequirement', label: 'Rank Requirement', type: 'text', placeholder: 'e.g. Gold+' },
      { name: 'voiceChat', label: 'Voice Chat', type: 'text', placeholder: 'e.g. Discord' },
      { name: 'maxPlayers', label: 'Max Players', type: 'number', placeholder: 'e.g. 5' }
    ]
  },
  {
    name: 'Music',
    fields: [
      { name: 'genre', label: 'Genre', type: 'text' },
      { name: 'instrument', label: 'Instrument', type: 'text' },
      { name: 'skillLevel', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'bringInstruments', label: 'Bring Instruments?', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    name: 'Entertainment',
    fields: [
      { name: 'eventName', label: 'Movie/Game Name', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' },
      { name: 'ticketPrice', label: 'Ticket Price', type: 'text' }
    ]
  },
  {
    name: 'Travel',
    fields: [
      { name: 'destination', label: 'Destination', type: 'text' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
      { name: 'estimatedBudget', label: 'Estimated Budget', type: 'text' },
      { name: 'transport', label: 'Transport', type: 'text' },
      { name: 'accommodation', label: 'Accommodation', type: 'text' }
    ]
  },
  {
    name: 'Photography',
    fields: [
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'cameraRequired', label: 'Camera Required?', type: 'select', options: ['Yes', 'No', 'Optional'] },
      { name: 'theme', label: 'Theme', type: 'text' }
    ]
  },
  {
    name: 'Food',
    fields: [
      { name: 'restaurant', label: 'Restaurant', type: 'text' },
      { name: 'cuisine', label: 'Cuisine', type: 'text' },
      { name: 'budget', label: 'Budget', type: 'text' },
      { name: 'reservationNeeded', label: 'Reservation Needed?', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    name: 'Community',
    fields: [
      { name: 'organization', label: 'Organization', type: 'text' },
      { name: 'cause', label: 'Cause', type: 'text' },
      { name: 'volunteersNeeded', label: 'Volunteers Needed', type: 'number' }
    ]
  },
  {
    name: 'Health & Fitness',
    fields: [
      { name: 'activity', label: 'Activity', type: 'text' },
      { name: 'fitnessLevel', label: 'Fitness Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'duration', label: 'Duration', type: 'text' }
    ]
  },
  {
    name: 'Arts & Culture',
    fields: [
      { name: 'artType', label: 'Art Type', type: 'text' },
      { name: 'materials', label: 'Materials', type: 'text' },
      { name: 'performanceRequired', label: 'Performance Required?', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    name: 'Pets',
    fields: [
      { name: 'petType', label: 'Pet Type', type: 'text' },
      { name: 'activity', label: 'Activity', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' }
    ]
  },
  {
    name: 'Family',
    fields: [
      { name: 'occasion', label: 'Occasion', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' }
    ]
  },
  {
    name: 'Social',
    fields: [
      { name: 'eventType', label: 'Event Type', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' }
    ]
  },
  {
    name: 'DIY & Hobbies',
    fields: [
      { name: 'hobbyType', label: 'Hobby Type', type: 'text' },
      { name: 'materials', label: 'Materials Needed', type: 'text' }
    ]
  },
  {
    name: 'Others',
    fields: [
      { name: 'additionalDetails', label: 'Additional Details', type: 'text' }
    ]
  }
];

function CreateLobby() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('manual'); // 'manual' | 'ai'
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingInfo, setMissingInfo] = useState([]);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [customCategory, setCustomCategory] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    time: '',
    location: '',
    maxParticipants: '',
    visibility: 'Public',
    tags: '',
    coverImage: null,
    // Dynamic fields will be added here
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file' && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          [name]: reader.result
        }));
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setMissingInfo([]);
    setAiGenerated(false);
    
    try {
      const aiData = await aiService.createEventFromPrompt(aiPrompt);
      
      setFormData(prev => ({
        ...prev,
        title: aiData.title || prev.title,
        description: aiData.description || prev.description,
        category: aiData.category || prev.category,
        date: aiData.date || prev.date,
        time: aiData.startTime || prev.time,
        location: (aiData.location && aiData.location.name) ? aiData.location.name : prev.location,
        maxParticipants: aiData.maxParticipants || prev.maxParticipants,
        tags: (aiData.tags && aiData.tags.length > 0) ? aiData.tags.join(', ') : prev.tags,
        ...(aiData.categoryDetails || {})
      }));

      if (aiData.missingInformation && aiData.missingInformation.length > 0) {
        setMissingInfo(aiData.missingInformation);
      }

      setAiGenerated(true);
      setMode('manual');
    } catch (error) {
      console.error("AI Generation failed:", error);
      alert("Couldn't generate the event right now. Try again or create it manually.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const selectedCategory = CATEGORIES.find(c => c.name === formData.category);
      let categoryDetails = {};
      
      if (selectedCategory) {
        selectedCategory.fields.forEach(field => {
          categoryDetails[field.name] = formData[field.name];
        });
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category === 'Others' && customCategory.trim() ? customCategory.trim() : formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        maxParticipants: formData.maxParticipants,
        visibility: formData.visibility,
        tags: formData.tags,
        categoryDetails
      };

      await lobbyService.createLobby(payload);
      fireConfetti();
      setTimeout(() => navigate('/'), 900);
    } catch (error) {
      console.error("Failed to create lobby:", error);
      alert("Failed to create lobby. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategoryObj = CATEGORIES.find(c => c.name === formData.category);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white flex flex-col lg:flex-row">
      {/* Left side: Image */}
      <div className="hidden lg:flex lg:w-1/3 xl:w-1/4 items-center justify-center p-8 bg-white">
        <img src="/logo-illustration.png" alt="Huddle Graphic" className="w-full max-w-[305px] h-auto object-contain" />
      </div>

      {/* Right side: Form Container */}
      <div className="flex-1 py-6 md:py-12 px-4 sm:px-6 lg:px-12 flex justify-center items-start bg-white overflow-y-auto">
        <div className="max-w-4xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden shrink-0">
        
        {/* Header & Mode Toggle */}
        <div className="border-b border-slate-100 px-4 md:px-8 py-6 md:py-8 bg-white flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create an Event</h2>
            <p className="text-slate-500 mt-1 text-sm">Start a new community and invite people to join</p>
          </div>

          {/* Toggle switch */}
          <div className="bg-slate-100 p-1 rounded-xl flex gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setMode('manual')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'manual' 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Manual
            </button>
            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                mode === 'ai' 
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Auto-fill with AI
            </button>
          </div>
        </div>

        <div className="p-4 md:p-8">
          {mode === 'ai' ? (
            <div className="animate-fade-in space-y-6 max-w-2xl mx-auto py-8">
              <div className="mb-8 p-6 bg-slate-50/40 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-2xl relative overflow-hidden group">
                {/* Decorative glassy blur inside the box */}
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-400/20 transition-colors duration-500"></div>
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-sky-400/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-400/20 transition-colors duration-500"></div>

                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2.5 mb-3 relative z-10">
                  <div className="w-7 h-7 rounded-xl bg-white/80 shadow-sm border border-white flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  Pro Tip for Best Results
                </h4>
                <p className="text-sm text-slate-500 mb-4 leading-relaxed relative z-10">To help the AI accurately generate your event form, please include these key details in your description:</p>
                <div className="space-y-3 relative z-10">
                  {[
                    { label: 'What', desc: 'is the event? (Title & Category)' },
                    { label: 'When', desc: 'is it happening? (Date & Time)' },
                    { label: 'Where', desc: 'is it located? (Venue or link)' },
                    { label: 'Who', desc: 'can join? (Max Participants)' },
                    { label: 'Requirements?', desc: '(E.g. equipment needed, entry fee)' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="w-5 h-5 rounded-lg bg-white/80 border border-white shadow-sm flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400"></div>
                      </div>
                      <p className="leading-snug"><span className="font-semibold text-slate-700">{item.label}</span> <span className="text-slate-500">{item.desc}</span></p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Describe your event</h3>
                <p className="text-slate-500 text-sm mt-1">Write a short description and we'll extract the details to fill the form.</p>
              </div>

              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Let's play football this Saturday at 5 PM in PSG Ground. Need 10 players."
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-colors resize-none shadow-sm"
                ></textarea>
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleAIGenerate}
                    disabled={isGenerating || !aiPrompt.trim()}
                    className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating...
                      </>
                    ) : (
                      'Generate Form'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-in space-y-10">
              
              {/* --- Common Fields --- */}
              <div>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <h3 className="text-base font-semibold text-slate-900">
                    Basic Information
                  </h3>
                  {aiGenerated && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Auto-filled
                    </span>
                  )}
                </div>

                {missingInfo.length > 0 && (
                  <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <div className="flex gap-3">
                      <div className="text-amber-500 mt-0.5">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-amber-800">Missing Information</h4>
                        <p className="text-sm text-amber-700 mt-1">Please fill in the following details manually:</p>
                        <ul className="list-disc list-inside mt-2 text-sm text-amber-700">
                          {missingInfo.map((info, index) => (
                            <li key={index} className="capitalize">{info}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      required
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Give your event a catchy name"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Description *</label>
                    <textarea
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="What is this event about?"
                      rows="3"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    >
                      <option value="" disabled>Select a category</option>
                      {CATEGORIES.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                    {formData.category === 'Others' && (
                      <div className="mt-4 animate-fade-in">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Specific Category *</label>
                        <input
                          type="text"
                          required
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          placeholder="What kind of event is this?"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Tags</label>
                    <input
                      type="text"
                      name="tags"
                      value={formData.tags}
                      onChange={handleChange}
                      placeholder="e.g. fun, workshop (comma separated)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date *</label>
                    <input
                      type="date"
                      name="date"
                      required
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Time *</label>
                    <input
                      type="time"
                      name="time"
                      required
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Location *</label>
                    <input
                      type="text"
                      name="location"
                      required
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Where is this happening?"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Max Participants</label>
                      <input
                        type="number"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        placeholder="Unlimited"
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Visibility</label>
                      <select
                        name="visibility"
                        value={formData.visibility}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                      >
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Cover Image (Optional)</label>
                    <div className="flex items-center justify-center w-full">
                        {formData.coverImage ? (
                          <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                            <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button 
                                type="button" 
                                onClick={() => setFormData(prev => ({ ...prev, coverImage: null }))}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-red-600 transition-colors"
                              >
                                Remove Image
                              </button>
                            </div>
                          </div>
                        ) : (
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <svg className="w-8 h-8 mb-3 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                  </svg>
                                  <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF</p>
                              </div>
                              <input id="dropzone-file" type="file" name="coverImage" accept="image/*" className="hidden" onChange={handleChange} />
                          </label>
                        )}
                    </div>
                  </div>

                </div>
              </div>

              {/* --- Category Specific Fields --- */}
              {selectedCategoryObj && (
                <div className="pt-8 border-t border-slate-100 animate-fade-in">
                  <h3 className="text-base font-semibold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                    {selectedCategoryObj.name.split(' ')[1] || 'Category'} Specifics
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-xl border border-slate-100">
                    {selectedCategoryObj.fields.map((field) => (
                      <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          {field.label} {field.required !== false && '*'}
                        </label>
                        
                        {field.type === 'select' ? (
                          <select
                            name={field.name}
                            required={field.required !== false}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm"
                          >
                            <option value="" disabled>Select {field.label.toLowerCase()}</option>
                            {field.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            name={field.name}
                            required={field.required !== false}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder || ''}
                            rows="3"
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none shadow-sm"
                          ></textarea>
                        ) : (
                          <input
                            type={field.type}
                            name={field.name}
                            required={field.required !== false}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder || ''}
                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors shadow-sm"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* --- Actions --- */}
              <div className="pt-8 border-t border-slate-100 flex gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/')}
                  className="flex-1 px-4 py-4 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-4 text-sm font-semibold text-white bg-blue-600/80 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Creating...
                    </>
                  ) : 'Create Event'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

export default CreateLobby;
