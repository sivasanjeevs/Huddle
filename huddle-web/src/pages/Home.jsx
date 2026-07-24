import React from 'react';

function Home() {
  return (
    <div className="w-full max-w-6xl mx-auto mt-8 px-4 grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
      
      {/* Discovery Lobbies */}
      <section className="lg:col-span-1 space-y-4">
        <h2 className="text-xl font-semibold mb-4 text-slate-800">Discovery Lobbies</h2>
        
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 hover:border-blue-500/50 transition-all cursor-pointer group">
          <h3 className="font-medium text-lg text-blue-400 group-hover:text-blue-300">AI Enthusiasts</h3>
          <p className="text-sm text-slate-500 mt-1">12 active • Discussing LLMs</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-lg border border-slate-200 hover:border-blue-500/50 transition-all cursor-pointer group">
          <h3 className="font-medium text-lg text-blue-400 group-hover:text-blue-300">React Developers</h3>
          <p className="text-sm text-slate-500 mt-1">5 active • Pair programming</p>
        </div>
      </section>

      {/* Event Workspace */}
      <section className="lg:col-span-2">
        <div className="bg-white h-full min-h-[500px] rounded-2xl shadow-xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-purple-900/10 pointer-events-none"></div>
          
          <div className="w-24 h-24 bg-slate-100/80 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-300 backdrop-blur-sm z-10">
            <svg className="w-12 h-12 text-blue-500/80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 z-10">Event Workspace</h2>
          <p className="text-slate-500 mt-3 max-w-md z-10 text-lg">Join a lobby or create a new workspace to start streaming audio, extracting tasks, and collaborating in real-time.</p>
          <button className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-slate-900 px-8 py-3 rounded-xl shadow-lg transition-all transform hover:scale-105 font-medium z-10">Start a Huddle</button>
        </div>
      </section>

    </div>
  );
}

export default Home;
