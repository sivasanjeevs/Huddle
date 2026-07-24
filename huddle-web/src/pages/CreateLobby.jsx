import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { lobbyService } from '../services/lobbyService';

const CATEGORIES = [
  {
    name: '⚽ Sports',
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
    name: '💻 Technology',
    fields: [
      { name: 'topic', label: 'Topic', type: 'text', placeholder: 'e.g. React Workshop' },
      { name: 'experienceLevel', label: 'Experience Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'mode', label: 'Mode', type: 'select', options: ['Online', 'Offline', 'Hybrid'] },
      { name: 'techStack', label: 'Tech Stack', type: 'text', placeholder: 'e.g. React + Tailwind' },
      { name: 'requirements', label: 'Requirements', type: 'text', placeholder: 'e.g. Laptop Required' }
    ]
  },
  {
    name: '📚 Education',
    fields: [
      { name: 'subject', label: 'Subject', type: 'text' },
      { name: 'level', label: 'Level', type: 'text' },
      { name: 'materialsNeeded', label: 'Materials Needed', type: 'text' },
      { name: 'duration', label: 'Duration', type: 'text' },
      { name: 'instructor', label: 'Instructor (optional)', type: 'text', required: false }
    ]
  },
  {
    name: '💼 Business',
    fields: [
      { name: 'meetingType', label: 'Meeting Type', type: 'text' },
      { name: 'industry', label: 'Industry', type: 'text' },
      { name: 'targetAudience', label: 'Target Audience', type: 'text' },
      { name: 'dressCode', label: 'Dress Code (optional)', type: 'text', required: false }
    ]
  },
  {
    name: '🎨 Design',
    fields: [
      { name: 'designTool', label: 'Design Tool', type: 'text' },
      { name: 'skillLevel', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'materialsNeeded', label: 'Materials Needed', type: 'text' }
    ]
  },
  {
    name: '🎮 Gaming',
    fields: [
      { name: 'game', label: 'Game', type: 'text', placeholder: 'e.g. Valorant' },
      { name: 'platform', label: 'Platform', type: 'text', placeholder: 'e.g. PC, PS5' },
      { name: 'rankRequirement', label: 'Rank Requirement', type: 'text', placeholder: 'e.g. Gold+' },
      { name: 'voiceChat', label: 'Voice Chat', type: 'text', placeholder: 'e.g. Discord' },
      { name: 'maxPlayers', label: 'Max Players', type: 'number', placeholder: 'e.g. 5' }
    ]
  },
  {
    name: '🎵 Music',
    fields: [
      { name: 'genre', label: 'Genre', type: 'text' },
      { name: 'instrument', label: 'Instrument', type: 'text' },
      { name: 'skillLevel', label: 'Skill Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'bringInstruments', label: 'Bring Instruments?', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    name: '🎬 Entertainment',
    fields: [
      { name: 'eventName', label: 'Movie/Game Name', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' },
      { name: 'ticketPrice', label: 'Ticket Price', type: 'text' }
    ]
  },
  {
    name: '✈️ Travel',
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
    name: '📸 Photography',
    fields: [
      { name: 'location', label: 'Location', type: 'text' },
      { name: 'cameraRequired', label: 'Camera Required?', type: 'select', options: ['Yes', 'No', 'Optional'] },
      { name: 'theme', label: 'Theme', type: 'text' }
    ]
  },
  {
    name: '🍔 Food',
    fields: [
      { name: 'restaurant', label: 'Restaurant', type: 'text' },
      { name: 'cuisine', label: 'Cuisine', type: 'text' },
      { name: 'budget', label: 'Budget', type: 'text' },
      { name: 'reservationNeeded', label: 'Reservation Needed?', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    name: '❤️ Community',
    fields: [
      { name: 'organization', label: 'Organization', type: 'text' },
      { name: 'cause', label: 'Cause', type: 'text' },
      { name: 'volunteersNeeded', label: 'Volunteers Needed', type: 'number' }
    ]
  },
  {
    name: '🧘 Health & Fitness',
    fields: [
      { name: 'activity', label: 'Activity', type: 'text' },
      { name: 'fitnessLevel', label: 'Fitness Level', type: 'select', options: ['Beginner', 'Intermediate', 'Advanced', 'Any'] },
      { name: 'duration', label: 'Duration', type: 'text' }
    ]
  },
  {
    name: '🎭 Arts & Culture',
    fields: [
      { name: 'artType', label: 'Art Type', type: 'text' },
      { name: 'materials', label: 'Materials', type: 'text' },
      { name: 'performanceRequired', label: 'Performance Required?', type: 'select', options: ['Yes', 'No'] }
    ]
  },
  {
    name: '🐶 Pets',
    fields: [
      { name: 'petType', label: 'Pet Type', type: 'text' },
      { name: 'activity', label: 'Activity', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' }
    ]
  },
  {
    name: '👨‍👩‍👧 Family',
    fields: [
      { name: 'occasion', label: 'Occasion', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' }
    ]
  },
  {
    name: '🎉 Social',
    fields: [
      { name: 'eventType', label: 'Event Type', type: 'text' },
      { name: 'venue', label: 'Venue', type: 'text' }
    ]
  },
  {
    name: '🔧 DIY & Hobbies',
    fields: [
      { name: 'hobbyType', label: 'Hobby Type', type: 'text' },
      { name: 'materials', label: 'Materials Needed', type: 'text' }
    ]
  },
  {
    name: '🌐 Others',
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

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) return;
    
    setIsGenerating(true);
    
    // Simulate AI extraction delay
    setTimeout(() => {
      let newFormData = { ...formData };
      const lowerPrompt = aiPrompt.toLowerCase();
      
      // Super basic mockup of AI extraction for demo purposes
      if (lowerPrompt.includes('football')) {
        newFormData.category = '⚽ Sports';
        newFormData.title = 'Football Match';
        newFormData.description = aiPrompt;
        newFormData.sportType = 'Football';
        
        // Find next saturday
        const today = new Date();
        const nextSaturday = new Date(today);
        nextSaturday.setDate(today.getDate() + ((6 + 7 - today.getDay()) % 7 || 7));
        newFormData.date = nextSaturday.toISOString().split('T')[0];
        
        if (lowerPrompt.includes('5 pm')) newFormData.time = '17:00';
        if (lowerPrompt.includes('psg ground')) {
          newFormData.location = 'PSG Ground';
          newFormData.groundVenue = 'PSG Ground';
        }
        if (lowerPrompt.includes('10 players')) {
          newFormData.maxParticipants = '10';
          newFormData.teamSize = '10';
        }
      } else {
        // Fallback for other texts
        newFormData.title = 'New Event';
        newFormData.description = aiPrompt;
        newFormData.category = '🌐 Others';
      }
      
      setFormData(newFormData);
      setIsGenerating(false);
      setMode('manual'); // Switch to manual so user can review the pre-filled fields
    }, 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        category: formData.category,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        maxParticipants: formData.maxParticipants,
        visibility: formData.visibility,
        tags: formData.tags,
        categoryDetails
      };

      await lobbyService.createLobby(payload);
      navigate('/');
    } catch (error) {
      console.error("Failed to create lobby:", error);
      alert("Failed to create lobby. Please try again.");
    }
  };

  const selectedCategoryObj = CATEGORIES.find(c => c.name === formData.category);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header & Mode Toggle */}
        <div className="bg-slate-900 px-8 py-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/3 -translate-x-1/3"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Create an Event</h2>
              <p className="text-slate-400 mt-2">Start a new community and invite people to join</p>
            </div>

            {/* Toggle switch */}
            <div className="bg-slate-800/80 p-1 rounded-xl flex gap-1 border border-slate-700/50 backdrop-blur-md">
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === 'manual' 
                    ? 'bg-slate-700 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                Manual Entry
              </button>
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  mode === 'ai' 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Magic
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          {mode === 'ai' ? (
            <div className="animate-fade-in space-y-6 max-w-2xl mx-auto py-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-100 to-indigo-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">Let AI do the heavy lifting</h3>
                <p className="text-slate-500 mt-2">Just write a sentence or two about your event. We'll extract all the details.</p>
              </div>

              <div className="relative">
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={`Example: "Let's play football this Saturday at 5 PM in PSG Ground. Need 10 players."`}
                  rows="4"
                  className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-200 rounded-2xl text-base focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-sm"
                ></textarea>
                
                <button
                  onClick={handleAIGenerate}
                  disabled={isGenerating || !aiPrompt.trim()}
                  className="absolute bottom-4 right-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting...
                    </>
                  ) : (
                    'Generate Event'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="animate-fade-in space-y-10">
              
              {/* --- Common Fields --- */}
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">1</span>
                  Basic Information
                </h3>
                
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
                  <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">2</span>
                    {selectedCategoryObj.name.split(' ')[1] || 'Category'} Specifics
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/30 p-6 rounded-2xl border border-indigo-100/50">
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
                  className="flex-1 px-4 py-4 text-sm font-semibold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-md transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/20"
                >
                  Create Event
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default CreateLobby;
