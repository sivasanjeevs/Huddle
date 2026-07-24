const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const replacements = [
  { from: /bg-gray-950/g, to: 'bg-slate-50' },
  { from: /bg-gray-900\/60/g, to: 'bg-white/80' },
  { from: /bg-gray-900/g, to: 'bg-white' },
  { from: /bg-gray-800\/50/g, to: 'bg-slate-50' },
  { from: /bg-gray-800\/80/g, to: 'bg-slate-100/80' },
  { from: /bg-gray-800/g, to: 'bg-white' },
  { from: /bg-gray-700/g, to: 'bg-slate-100' },
  
  { from: /border-gray-800/g, to: 'border-slate-200' },
  { from: /border-gray-700/g, to: 'border-slate-300' },
  { from: /border-white\/20/g, to: 'border-blue-100' },

  { from: /text-gray-200/g, to: 'text-slate-800' },
  { from: /text-gray-300/g, to: 'text-slate-700' },
  { from: /text-gray-400/g, to: 'text-slate-500' },
  { from: /text-gray-500/g, to: 'text-slate-400' },
  
  { from: /text-white/g, to: 'text-slate-900' },
  
  // Specific inputs
  { from: /bg-gray-950\/50/g, to: 'bg-slate-50' },
  { from: /placeholder-gray-500/g, to: 'placeholder-slate-400' },
  { from: /ring-offset-gray-900/g, to: 'ring-offset-white' },
];

const files = walkSync('./huddle-web/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  replacements.forEach(r => {
    content = content.replace(r.from, r.to);
  });
  fs.writeFileSync(file, content);
});
console.log('Done replacing theme classes.');
