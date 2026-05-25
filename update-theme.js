const fs = require('fs');

const files = [
  'src/app/dashboard/history/page.tsx',
  'src/app/dashboard/settings/page.tsx',
  'src/app/dashboard/social/page.tsx',
  'src/app/dashboard/workspaces/page.tsx'
];

function updateTheme(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found: ' + filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  // Text colors
  content = content.replace(/text-white/g, 'text-slate-900');
  content = content.replace(/text-slate-200/g, 'text-slate-700');
  content = content.replace(/text-slate-300/g, 'text-slate-600');
  content = content.replace(/text-slate-400/g, 'text-slate-500');
  content = content.replace(/text-zinc-300/g, 'text-slate-700');
  content = content.replace(/text-zinc-400/g, 'text-slate-500');
  content = content.replace(/text-zinc-500/g, 'text-slate-500');
  content = content.replace(/text-zinc-600/g, 'text-slate-400');
  
  // Highlight colors
  content = content.replace(/text-blue-400/g, 'text-blue-600');
  content = content.replace(/text-pink-400/g, 'text-pink-600');
  content = content.replace(/text-purple-400/g, 'text-purple-600');
  content = content.replace(/text-emerald-400/g, 'text-emerald-600');
  content = content.replace(/text-amber-400/g, 'text-amber-600');
  content = content.replace(/text-sky-400/g, 'text-sky-600');
  content = content.replace(/text-red-400/g, 'text-red-600');
  content = content.replace(/text-red-500/g, 'text-red-600');
  content = content.replace(/text-green-400/g, 'text-green-600');

  // Specific SVGs that had stroke="white"
  content = content.replace(/stroke="white"/g, 'stroke="currentColor"');
  
  // Backgrounds
  content = content.replace(/bg-white\/5/g, 'bg-white');
  content = content.replace(/bg-white\/\[0\.01\]/g, 'bg-white');
  content = content.replace(/bg-white\/\[0\.02\]/g, 'bg-white');
  content = content.replace(/bg-white\/\[0\.03\]/g, 'bg-slate-50');
  content = content.replace(/bg-black\/20/g, 'bg-slate-50');
  content = content.replace(/bg-black\/40/g, 'bg-slate-50');
  content = content.replace(/bg-slate-800\/40/g, 'bg-white');
  content = content.replace(/bg-slate-800\/60/g, 'bg-slate-50');
  content = content.replace(/bg-slate-700/g, 'bg-slate-100');
  content = content.replace(/bg-slate-800/g, 'bg-slate-100');
  content = content.replace(/bg-slate-900/g, 'bg-slate-50');
  content = content.replace(/bg-\[\#1E293B\]/g, 'bg-white');
  content = content.replace(/bg-\[\#060a14\]/g, 'bg-white');
  
  // Borders
  content = content.replace(/border-white\/10/g, 'border-slate-200');
  content = content.replace(/border-white\/5/g, 'border-slate-200');
  content = content.replace(/border-white\/6/g, 'border-slate-200');
  content = content.replace(/border-white\/8/g, 'border-slate-200');
  content = content.replace(/border-slate-700\/50/g, 'border-slate-200');
  content = content.replace(/border-slate-600/g, 'border-slate-300');
  content = content.replace(/border-red-500\/30/g, 'border-red-200');
  content = content.replace(/border-red-500\/20/g, 'border-red-200');
  content = content.replace(/border-red-500\/10/g, 'border-red-200');
  
  // Inline RGBA Backgrounds in history page
  content = content.replace(/rgba\(255,255,255,0\.02\)/g, '#ffffff');
  content = content.replace(/rgba\(255,255,255,0\.03\)/g, '#ffffff');
  content = content.replace(/rgba\(88,86,214,0\.12\)/g, 'rgba(88,86,214,0.05)');
  content = content.replace(/rgba\(52,211,153,0\.12\)/g, 'rgba(52,211,153,0.05)');
  content = content.replace(/rgba\(52,170,220,0\.12\)/g, 'rgba(52,170,220,0.05)');
  content = content.replace(/rgba\(251,191,36,0\.12\)/g, 'rgba(251,191,36,0.05)');
  
  // Remove backdrop-blur if we are solid white
  content = content.replace(/backdrop-blur-xl/g, '');
  content = content.replace(/backdrop-blur-2xl/g, '');
  content = content.replace(/backdropFilter: "blur\(12px\)"/g, 'boxShadow: "0 1px 3px rgba(0,0,0,0.05)"');
  
  // Gradients
  content = content.replace(/bg-gradient-to-br from-white\/10 to-transparent/g, 'bg-white');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

files.forEach(updateTheme);
