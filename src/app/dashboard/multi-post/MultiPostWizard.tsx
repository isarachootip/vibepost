"use client";

import React, { useState } from "react";
import { generateAIPost, createScheduledPost } from "@/lib/actions/posts";
import { Button } from "@/components/ui/button";
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
  const [selectedChannels, setถูกเลือกแล้วChannels] = useState<string[]>([]);
  
  // Step 1 State
  const [topic, setTopic] = useState("");
  const [variantCount, setVariantCount] = useState("3");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=400&auto=format&fit=crop");
  
  // Step 2 & 3 State
  const [isGenerating, setIsGenerating] = useState(false);
  const [variants, setVariants] = useState<string[]>([]);
  const [selectedContent, setถูกเลือกแล้วContent] = useState("");
  
  // Step 4 State
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);
  const [error, setError] = useState("");

  const toggleChannel = (id: string) => {
    setถูกเลือกแล้วChannels(prev => 
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
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-red-600 -z-10 rounded-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
        
        {[1, 2, 3, 4].map((num) => (
          <div key={num} className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-500 border-2 ${step >= num ? 'bg-red-600 text-white border-red-600 shadow-md' : 'bg-white text-slate-400 border-slate-200'}`}>
            {num}
          </div>
        ))}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden min-h-[400px]">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}

        {/* STEP 1: Input Phase */}
        {step === 1 && (
          <div className="space-y-8 animate-in slide-in-from-right-8">
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">1. Select Target Channels</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {connections.map((conn) => {
                  const isActive = selectedChannels.includes(conn.id);
                  return (
                    <button
                      key={conn.id}
                      onClick={() => toggleChannel(conn.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        isActive 
                          ? 'border-red-600 bg-red-50 shadow-sm' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{conn.platform}</span>
                        {isActive && <CheckCircle2 className="w-5 h-5 text-red-600" />}
                      </div>
                      <div className="text-sm font-semibold text-slate-800 truncate">{conn.accountName}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">2. Topic & Instructions</h3>
                <Textarea 
                  placeholder="e.g. โปรโมชั่นหน้าร้อน ซื้อ 1 แถม 1..." 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 h-32 resize-none focus-visible:ring-red-600"
                />
                
                <div className="mt-4">
                  <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wide">Variations to Generate</label>
                  <select 
                    value={variantCount} 
                    onChange={(e) => setVariantCount(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent font-medium"
                  >
                    <option value="1">1 Option</option>
                    <option value="3">3 Options</option>
                    <option value="5">5 Options</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">3. Attach Media</h3>
                <label className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-slate-300 transition-colors h-32 flex flex-col items-center justify-center bg-slate-50 cursor-pointer block">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageUrl(URL.createObjectURL(e.target.files[0]));
                      }
                    }} 
                  />
                  <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-600">Click to upload image/video</p>
                  <p className="text-xs text-slate-400 mt-1">(Select a file from your computer)</p>
                </label>
                {imageUrl && (
                  <div className="mt-4 relative w-full h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                    <img src={imageUrl} alt="Attached" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-end border-t border-slate-100">
              <Button 
                onClick={handleGenerate} 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-md"
              >
                <Bot className="w-5 h-5 mr-2" /> Generate Magic Content
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: Loading State */}
        {step === 2 && isGenerating && (
          <div className="h-[400px] flex flex-col items-center justify-center animate-in fade-in">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
              <Bot className="absolute inset-0 m-auto w-10 h-10 text-slate-400 animate-pulse" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">AI is drafting your content...</h2>
            <p className="text-slate-500 font-medium">Analyzing topic and generating {variantCount} variations.</p>
          </div>
        )}

        {/* STEP 3: Selection Phase */}
        {step === 3 && (
          <div className="space-y-8 animate-in slide-in-from-right-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutTemplate className="text-red-600" /> Choose the Best Variant
              </h3>
              <Button variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50 font-medium" onClick={() => setStep(1)}>
                ย้อนกลับ to Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {variants.map((variant, idx) => (
                <div 
                  key={idx}
                  onClick={() => setถูกเลือกแล้วContent(variant)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedContent === variant 
                      ? 'border-red-600 bg-red-50 shadow-md ring-4 ring-red-600/10' 
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="text-xs font-bold text-red-600 mb-3 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Option {idx + 1}
                  </div>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">{variant}</p>
                </div>
              ))}
            </div>

            {selectedContent && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
                <h4 className="text-sm font-bold text-slate-800 mb-3 uppercase tracking-wider border-b border-slate-100 pb-2">Fine-tune your selected content:</h4>
                <Textarea 
                  value={selectedContent}
                  onChange={(e) => setถูกเลือกแล้วContent(e.target.value)}
                  className="bg-white border-slate-200 text-slate-800 h-40 resize-none text-lg leading-relaxed focus-visible:ring-red-600 shadow-inner"
                />
                
                <div className="mt-8 p-6 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-base font-bold text-slate-800 mb-4">Publishing Options</h4>
                  <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1 w-full">
                      <label className="text-xs font-bold text-slate-600 mb-2 block uppercase tracking-wide">Schedule Date</label>
                      <Popover>
                        <PopoverTrigger 
                          className={`w-full justify-start text-left font-semibold bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 inline-flex items-center rounded-xl transition-colors h-12 px-4 py-2 ${!date && "text-slate-400"}`}
                        >
                          <CalendarIcon className="mr-3 h-5 w-5 text-slate-400" />
                          {date ? format(date, "PPP") : <span>Pick a date</span>}
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-white border-slate-200 text-slate-800 shadow-xl rounded-xl">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="bg-white text-slate-800 rounded-xl"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                      <Button 
                        disabled={isPublishing}
                        onClick={() => handlePublish(false)}
                        className="flex-1 h-12 bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-200 font-bold px-6 rounded-xl"
                      >
                        {isPublishing ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : <CalendarIcon className="w-5 h-5 mr-2 text-slate-400" />}
                        Schedule
                      </Button>
                      <Button 
                        disabled={isPublishing}
                        onClick={() => handlePublish(true)}
                        className="flex-1 h-12 bg-red-600 hover:bg-red-700 text-white font-bold px-8 rounded-xl shadow-md"
                      >
                        {isPublishing ? <RefreshCcw className="w-5 h-5 animate-spin mr-2" /> : <Send className="w-5 h-5 mr-2" />}
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
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6 border-8 border-green-100">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">Content Queued!</h2>
            <p className="text-slate-500 text-center max-w-md font-medium text-lg">
              Your post has been successfully scheduled and is waiting for the Auto-Post Engine to dispatch it.
            </p>
            <div className="mt-10 flex gap-4">
              <Button variant="outline" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-bold px-6 py-6 rounded-xl" onClick={() => window.location.href='/dashboard/history'}>
                View History
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-6 rounded-xl shadow-md" onClick={() => {
                setStep(1);
                setPublishSuccess(false);
                setTopic("");
                setถูกเลือกแล้วContent("");
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
