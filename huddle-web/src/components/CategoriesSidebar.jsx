import React from 'react';
import { GROUPED_CATEGORIES } from '../constants/categories';

export default function CategoriesSidebar({ selectedCategory, setSelectedCategory }) {
  return (
    <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col">
      <div className="relative p-6 border-b border-slate-100 bg-gradient-to-bl from-purple-50/50 via-white to-white overflow-hidden">
        
        <div className="relative z-10 flex items-center justify-between w-full h-full">
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl font-extrabold text-black tracking-tight">Categories</h2>
            <p className="text-sm text-slate-500 font-medium mt-1">Browse by topic</p>
          </div>
          
          {selectedCategory ? (
            <button 
              onClick={() => setSelectedCategory(null)} 
              className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2.5 rounded-xl transition-all shadow-md hover:shadow-lg focus:ring-4 focus:ring-purple-500/20"
            >
              Clear Selection
            </button>
          ) : (
            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-inner">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="4" y="4" width="7" height="7" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="13" y="4" width="7" height="16" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <rect x="4" y="13" width="7" height="7" rx="2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 p-4 space-y-4 bg-slate-50/50">
        {GROUPED_CATEGORIES.map((category) => {
          const isSelected = selectedCategory?.id === category.id;
          return (
            <div 
              key={category.id}
              onClick={() => setSelectedCategory(isSelected ? null : category)}
              className={`group relative h-28 rounded-xl overflow-hidden cursor-pointer shadow-sm border transition-all ${
                isSelected ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              {/* Category Image */}
              <img 
                src={category.image} 
                alt={category.name}
                className={`absolute inset-0 w-full h-full object-cover transition-transform duration-700 bg-slate-200 ${
                  isSelected ? 'scale-110' : 'group-hover:scale-110'
                }`}
              />
              
              {/* Overlay */}
              <div className={`absolute inset-0 transition-colors duration-300 ${
                isSelected 
                  ? 'bg-gradient-to-t from-blue-900/90 to-blue-900/40' 
                  : 'bg-gradient-to-t from-slate-900/80 to-slate-900/20 group-hover:from-slate-900/90 group-hover:to-slate-900/30'
              }`}></div>
              
              {/* Text Content */}
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <h3 className="text-white font-bold text-lg tracking-wide">{category.name}</h3>
                <div className={`flex items-center text-xs font-medium mt-1 transition-all duration-300 ${
                  isSelected ? 'text-blue-200 opacity-100 translate-y-0' : 'text-slate-300 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                }`}>
                  {isSelected ? 'Viewing lobbies' : 'Explore lobbies'}
                  <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
