"use client";

import React, { useState } from "react";
import { generateAIPost, createScheduledPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { 
  CalendarIcon, Sparkles, Send, CheckCircle2, RefreshCcw, 
  Image as ImageIcon, Bot, LayoutTemplate
} from "lucide-react";

type Connection = {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
};

export function MultiPostWizard({ connections }: { connections: Connection[] }) {
  const [step, setStep] = useState(1);
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  
  // Step 1 State
  const [topic, setTopic] = useState("");
  const [variantCount, setVariantCount] = useState("3");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop");
  
  // Step 2 & 3 State
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedContent, setSelectedContent] = useState("");
  
  // Step 4 State
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [error, setError] = useState("");

  const toggleChannel = (id: string) => {
    setSelectedChannels(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleGenerate = async () => {
    if (selectedChannels.length === 0) {
      setError("Please select at least one social channel.");
      return;
    }
    if (!topic.trim()) {
      setError("Please enter a topic or keyword.");
      return;
    }

    setError("");
    setStep(2);
    setIsGenerating(true);

    const res = await generateAIPost(topic, parseInt(variantCount) || 3);
    setIsGenerating(false);

    if (res.success) {
      setVariants(res.variants);
      setStep(3);
    } else {
      setError(res.error || "Failed to generate content.");
      setStep(1); // Go back if error
    }
  };

  const handlePublish = async (isPostNow: boolean) => {
    if (!selectedContent.trim()) {
      setError("Content cannot be empty.");
      return;
    }

    setError("");
    setIsPublishing(true);

    const publishDate = isPostNow ? new Date() : (date || new Date());

    const res = await createScheduledPost({
      content: selectedContent,
      scheduledTime: publishDate,
      targetConnectionIds: selectedChannels,
      imageUrl: imageUrl
    });

    setIsPublishing(false);

    if (res.success) {
      setPublishSuccess(true);
      setStep(4);
    } else {
      setError(res.error || "Failed to schedule post.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 px-4 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/10 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-fuchsia-500 -z-10 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
        
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 ${step >= num ? 'bg-fuchsia-500 text-white shadow-lg shadow-fuchsia-500/50' : 'bg-[#0f1423] text-slate-500 border border-white/20'}`}>
            {num}
          </div>
        ))}
      </div>

      <div className="bg-[#0f1423]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl relative overflow-hidden min-h-[400px]">
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* STEP 1: Input Phase */}
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-3">1. Select Target Channels</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {connections.map((conn) => {
                  const isActive = selectedChannels.includes(conn.id);
                  return (
                    <button
                      key={conn.id}
                      onClick={() => toggleChannel(conn.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isActive 
                          ? 'border-fuchsia-500 bg-fuchsia-500/20 shadow-lg shadow-fuchsia-500/20' 
                          : 'border-white/10 bg-white/5 hover:border-white/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-slate-400">{conn.platform}</span>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-fuchsia-400" />}
                      </div>
                      <div className="text-sm font-semibold text-white truncate">{conn.accountName}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-white mb-3">2. Topic & Instructions</h3>
                <Textarea 
                  placeholder="e.g. โปรโมชั่นหน้าร้อน ซื้อ 1 แถม 1..." 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 h-32 resize-none"
                />
                
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-xs font-semibold text-slate-400 mb-1 block">Variations to Generate</label>
                    <select 
                      value={variantCount} 
                      onChange={(e) => setVariantCount(e.target.value)}
                      className="w-full bg-black/20 border border-white/10 text-white rounded-lg p-2 text-sm focus:outline-none focus:border-fuchsia-500"
                    >
                      <option value="1">1 Option</option>
                      <option value="3">3 Options</option>
                      <option value="5">5 Options</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white mb-3">3. Attach Media</h3>
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 text-center hover:border-white/30 transition-colors h-32 flex flex-col items-center justify-center bg-black/10">
                  <ImageIcon className="w-8 h-8 text-slate-500 mb-2" />
                  <p className="text-xs text-slate-400">Click to upload image/video</p>
                  <p className="text-[10px] text-slate-600 mt-1">(Demo: using placeholder image)</p>
                </div>
                {imageUrl && (
                  <div className="mt-3 relative w-full h-24 rounded-lg overflow-hidden border border-white/10">
                    <img src={imageUrl} alt="Attached" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button 
                onClick={handleGenerate} 
                className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white px-8 py-6 rounded-xl font-bold text-lg"
              >
                <Bot className="w-5 h-5 mr-2" /> Generate Magic Content
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Loading State */}
        {step === 2 && isGenerating && (
          <div className="h-[400px] flex flex-col items-center justify-center animate-in fade-in">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-fuchsia-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-fuchsia-500 rounded-full border-t-transparent animate-spin"></div>
              <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-fuchsia-400 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">AI is drafting your content...</h2>
            <p className="text-slate-400 text-sm">Analyzing topic and generating {variantCount} variations.</p>
          </div>
        )}

        {/* STEP 3: Selection Phase */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <LayoutTemplate className="text-fuchsia-400" /> Choose the Best Variant
              </h3>
              <Button variant="outline" className="border-white/10 bg-transparent text-slate-300" onClick={() => setStep(1)}>
                Back to Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {variants.map((variant, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedContent(variant)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    selectedContent === variant 
                      ? 'border-fuchsia-500 bg-fuchsia-500/10 shadow-lg shadow-fuchsia-500/20 ring-2 ring-fuchsia-500 ring-offset-2 ring-offset-[#0f1423]' 
                      : 'border-white/10 bg-black/20 hover:border-white/30 hover:bg-white/5'
                  }`}
                >
                  <div className="text-xs font-bold text-fuchsia-400 mb-2 uppercase tracking-wider">Option {idx + 1}</div>
                  <p className="text-sm text-slate-300 whitespace-pre-wrap">{variant}</p>
                </div>
              ))}
            </div>

            {selectedContent && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="text-sm font-bold text-slate-400 mb-2 uppercase">Fine-tune your selected content:</h4>
                <Textarea 
                  value={selectedContent}
                  onChange={(e) => setSelectedContent(e.target.value)}
                  className="bg-black/40 border-fuchsia-500/30 text-white h-40 resize-none text-lg leading-relaxed focus-visible:ring-fuchsia-500"
                />
                
                <div className="mt-6 p-6 rounded-2xl bg-black/20 border border-white/5">
                  <h4 className="text-sm font-bold text-white mb-4">Publishing Options</h4>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-slate-400 mb-2 block">Schedule Date</label>
                      <Popover>
                        <PopoverTrigger 
                          className={`w-full justify-start text-left font-normal bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:text-white inline-flex items-center rounded-md text-sm transition-colors h-10 px-4 py-2 ${!date && "text-muted-foreground"}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-fuchsia-400" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#0f1423] border-white/10 text-white">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="bg-[#0f1423] text-white"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                      <Button 
                        disabled={isPublishing}
                        onClick={() => handlePublish(false)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/10"
                      >
                        {isPublishing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <CalendarIcon className="w-4 h-4 mr-2" />}
                        Schedule Post
                      </Button>
                      <Button 
                        disabled={isPublishing}
                        onClick={() => handlePublish(true)}
                        className="flex-1 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 text-white font-bold shadow-lg shadow-fuchsia-500/25"
                      >
                        {isPublishing ? <RefreshCcw className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                        Post Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Success Phase */}
        {step === 4 && publishSuccess && (
          <div className="h-[400px] flex flex-col items-center justify-center animate-in zoom-in-95">
            <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-2">Content Queued!</h2>
            <p className="text-slate-400 text-center max-w-md">
              Your post has been successfully scheduled and is waiting for the Auto-Post Engine to dispatch it.
            </p>
            <div className="mt-8 flex gap-4">
              <Button variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => window.location.href='/dashboard/history'}>
                View History
              </Button>
              <Button className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white" onClick={() => {
                setStep(1);
                setPublishSuccess(false);
                setTopic("");
                setSelectedContent("");
              }}>
                Create Another Post
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
