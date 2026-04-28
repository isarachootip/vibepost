"use client";

import React, { useState } from "react";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Image as ImageIcon, 
  Video, 
  Smile, 
  Hash,
  Send,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCcw,
  Bot
} from "lucide-react";

const channels = [
  { id: "facebook", name: "Facebook Page", icon: Facebook, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", activeBg: "bg-blue-500" },
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500", bg: "bg-pink-500/10", border: "border-pink-500/20", activeBg: "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500" },
  { id: "twitter", name: "X (Twitter)", icon: Twitter, color: "text-slate-200", bg: "bg-slate-800/50", border: "border-slate-700", activeBg: "bg-slate-800" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", activeBg: "bg-blue-600" },
];

export default function MultiPostDemoPage() {
  const [content, setContent] = useState("Excited to announce our upcoming feature release! 🚀 Our team has been working hard to bring you the best experience. Stay tuned for more updates. #TechUpdate #Innovation #VibePost");
  const [selectedChannels, setSelectedChannels] = useState(["facebook", "instagram", "twitter"]);
  const [isPosting, setIsPosting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [useAI, setUseAI] = useState(false);

  const toggleChannel = (id: string) => {
    if (selectedChannels.includes(id)) {
      setSelectedChannels(selectedChannels.filter(c => c !== id));
    } else {
      setSelectedChannels([...selectedChannels, id]);
    }
  };

  const handlePost = () => {
    if (selectedChannels.length === 0) return;
    setIsPosting(true);
    setTimeout(() => {
      setIsPosting(false);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    }, 2000);
  };

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-700 ease-out min-h-screen">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight drop-shadow-sm flex items-center gap-3">
            <Send className="w-8 h-8 text-indigo-400" />
            Universal Auto-Post
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">
            Compose once, distribute everywhere. Automate your social presence across all channels.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Composer */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Channels Selection */}
          <div className="bg-[#0f1423]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              Select Channels
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {channels.map((channel) => {
                const isActive = selectedChannels.includes(channel.id);
                const Icon = channel.icon;
                return (
                  <button
                    key={channel.id}
                    onClick={() => toggleChannel(channel.id)}
                    className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border transition-all duration-300 overflow-hidden group ${
                      isActive 
                        ? \`border-transparent shadow-lg shadow-black/20\` 
                        : \`\${channel.border} \${channel.bg} hover:border-white/20\`
                    }`}
                  >
                    {isActive && (
                      <div className={\`absolute inset-0 \${channel.activeBg} opacity-20\`} />
                    )}
                    {isActive && (
                      <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <Icon className={\`w-8 h-8 mb-3 transition-transform group-hover:scale-110 \${isActive ? channel.color : 'text-slate-500'}\`} />
                    <span className={\`text-xs font-semibold \${isActive ? 'text-white' : 'text-slate-400'}\`}>
                      {channel.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Composer Box */}
          <div className="bg-[#0f1423]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                Compose Content
              </h3>
              <button 
                onClick={() => setUseAI(!useAI)}
                className={\`flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full transition-colors \${useAI ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'}\`}
              >
                <Bot className="w-4 h-4" />
                AI Assist {useAI ? 'ON' : 'OFF'}
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What do you want to share with your audience?"
              className="w-full h-40 bg-black/20 border border-white/5 rounded-2xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none font-medium leading-relaxed"
            />

            {useAI && (
              <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-indigo-200 mb-2">AI is ready to enhance your post. Choose a tone:</p>
                  <div className="flex gap-2">
                    <button className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-md bg-white/10 text-white hover:bg-indigo-500 hover:text-white transition-colors">Professional</button>
                    <button className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-md bg-white/10 text-white hover:bg-pink-500 hover:text-white transition-colors">Engaging</button>
                    <button className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-md bg-white/10 text-white hover:bg-amber-500 hover:text-white transition-colors">Hard Sell</button>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex gap-2">
                <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Add Media">
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Add Video">
                  <Video className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Add Hashtags">
                  <Hash className="w-5 h-5" />
                </button>
                <button className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-colors" title="Add Emoji">
                  <Smile className="w-5 h-5" />
                </button>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {content.length} / 2200
              </span>
            </div>
            
            {/* Mockup attached image */}
            <div className="mt-4 relative group">
               <div className="w-32 h-32 rounded-xl overflow-hidden border border-white/10">
                 <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Attached" />
               </div>
               <button className="absolute top-2 left-26 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">×</button>
            </div>
          </div>

        </div>

        {/* Right Column: Previews & Action */}
        <div className="lg:col-span-5 space-y-6 flex flex-col">
          
          <div className="bg-[#0f1423]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl flex-grow flex flex-col">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
              <span>Live Previews</span>
              <span className="text-xs bg-white/5 px-2 py-1 rounded text-slate-300">{selectedChannels.length} Channels</span>
            </h3>

            <div className="flex-grow space-y-4 overflow-y-auto pr-2 custom-scrollbar" style={{maxHeight: '400px'}}>
              {selectedChannels.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-sm font-medium">
                  Select channels to see previews
                </div>
              ) : (
                selectedChannels.map(channelId => {
                  const channel = channels.find(c => c.id === channelId);
                  if (!channel) return null;
                  const Icon = channel.icon;
                  return (
                    <div key={channel.id} className="bg-black/30 border border-white/5 rounded-2xl p-4 animate-in fade-in slide-in-from-right-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-xs">V</div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">VibePost Brand</p>
                          <p className="text-[10px] text-slate-500">Just now • <Icon className={\`inline w-3 h-3 \${channel.color}\`} /></p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed break-words whitespace-pre-wrap line-clamp-3">
                        {content || "No content yet..."}
                      </p>
                      <div className="mt-3 h-24 w-full rounded-lg bg-white/5 overflow-hidden border border-white/5">
                        <img src="https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Preview" />
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* Action Button */}
          <div className="bg-[#0f1423]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
             {isSuccess && (
               <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm z-10 flex flex-col items-center justify-center animate-in fade-in duration-300">
                 <CheckCircle2 className="w-12 h-12 text-green-400 mb-2 animate-bounce" />
                 <p className="text-white font-bold text-lg">Successfully Queued!</p>
               </div>
             )}

             <div className="flex gap-3 mb-4">
               <button className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                 <Calendar className="w-4 h-4" />
                 Schedule
               </button>
               <button className="flex-1 py-3 px-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-sm hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
                 Save Draft
               </button>
             </div>

             <button 
               onClick={handlePost}
               disabled={selectedChannels.length === 0 || isPosting || isSuccess}
               className={\`w-full py-4 rounded-xl font-bold text-white text-lg transition-all shadow-xl flex items-center justify-center gap-3 \${
                 selectedChannels.length === 0 
                  ? 'bg-slate-700/50 cursor-not-allowed text-slate-400' 
                  : isPosting
                    ? 'bg-indigo-600/80 cursor-wait'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5'
               }\`}
             >
               {isPosting ? (
                 <>
                   <RefreshCcw className="w-5 h-5 animate-spin" />
                   Processing Channels...
                 </>
               ) : (
                 <>
                   <Send className="w-5 h-5" />
                   Auto-Post to {selectedChannels.length || '0'} Channels
                 </>
               )}
             </button>
          </div>

        </div>
      </div>
    </div>
  );
}
