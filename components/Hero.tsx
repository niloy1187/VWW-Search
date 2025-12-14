import React, { useState, useEffect } from 'react';
import { MapPin, Users, ArrowRight, Sparkles, IndianRupee, PartyPopper, CheckSquare, Plane, Car, Tent, Briefcase, Crown, Wifi, ShieldCheck, Play, Video, Loader2 } from 'lucide-react';
import { SearchParams, UserStats, SearchCategory } from '../types';
import { BrandLogo } from './BrandLogo';
import { generateVeoBackground } from '../services/geminiService';

interface HeroProps {
  onSearch: (params: SearchParams) => void;
  isSearching: boolean;
  userStats: UserStats;
}

const CATEGORIES: { id: SearchCategory; label: string; icon: React.FC<any> }[] = [
    { id: 'stays', label: 'Stays', icon: Tent },
    { id: 'flights', label: 'Flights', icon: Plane },
    { id: 'rentals', label: 'Rentals', icon: Car },
    { id: 'activities', label: 'Activities', icon: Sparkles },
    { id: 'packages', label: 'Packages', icon: Briefcase },
];

const VIBES = [
    { id: '', label: 'Any Vibe' },
    { id: 'Romantic', label: 'Romantic' },
    { id: 'Adventure', label: 'Adventure' },
    { id: 'Relaxing', label: 'Relaxing' },
    { id: 'RoadTrip', label: 'Road Trip' },
    { id: 'Party', label: 'Party' },
    { id: 'Spiritual', label: 'Spiritual' }
];

// Using the specifically requested video file as default
const DEFAULT_VIDEO = "grok-video-9302df42-ff6b-46e2-8bb5-695a481e4c5e.mp4";

export const Hero: React.FC<HeroProps> = ({ onSearch, isSearching }) => {
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('stays');
  const [location, setLocation] = useState(''); 
  const [origin, setOrigin] = useState(''); 
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [guests, setGuests] = useState(2);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [vibe, setVibe] = useState('');
  const [squadTrip, setSquadTrip] = useState(false);
  const [workation, setWorkation] = useState(false);
  const [vwwRecommended, setVwwRecommended] = useState(false);
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('roundtrip');
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffTime, setDropoffTime] = useState('10:00');
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  // Veo / Video State
  const [videoSrc, setVideoSrc] = useState(DEFAULT_VIDEO);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [showVideoPrompt, setShowVideoPrompt] = useState(false);
  const [videoPrompt, setVideoPrompt] = useState("A cinematic road trip through the Himalayas at sunset");

  // Dynamic Text Effect
  const [subHeadlineIndex, setSubHeadlineIndex] = useState(0);
  const COMPARISONS = [
      "Better than Trivago.",
      "Smarter than CozyCozy.",
      "Deeper than HomeyHuts.",
      "More Authentic than Airbnb."
  ];

  useEffect(() => {
      const interval = setInterval(() => {
          setSubHeadlineIndex(prev => (prev + 1) % COMPARISONS.length);
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location && activeCategory !== 'flights') return; 
    onSearch({ 
      category: activeCategory, location, origin: activeCategory === 'flights' ? origin : undefined,
      checkIn, checkOut: activeCategory === 'flights' && tripType === 'oneway' ? undefined : checkOut,
      pickupTime: activeCategory === 'rentals' ? pickupTime : undefined, dropoffTime: activeCategory === 'rentals' ? dropoffTime : undefined,
      tripType: activeCategory === 'flights' ? tripType : undefined, isFlexible, guests, maxPrice, vibe: vibe || undefined, 
      squadTrip, workation, vwwRecommended
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSubmitted(true);
  };

  const handleGenerateBackground = async () => {
    try {
        // @ts-ignore
        if (window.aistudio && window.aistudio.hasSelectedApiKey) {
            // @ts-ignore
            const hasKey = await window.aistudio.hasSelectedApiKey();
            if (!hasKey) {
                // @ts-ignore
                await window.aistudio.openSelectKey();
                // @ts-ignore
                const hasKeyNow = await window.aistudio.hasSelectedApiKey();
                if (!hasKeyNow) return; 
            }
        }

        setIsGeneratingVideo(true);
        setShowVideoPrompt(false);
        const newVideoUrl = await generateVeoBackground(videoPrompt);
        setVideoSrc(newVideoUrl);
    } catch (e) {
        console.error("Veo generation failed", e);
        alert("Video generation failed. Please try again.");
    } finally {
        setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col justify-center pt-32 pb-16 px-4 overflow-hidden">
      
      {/* Dynamic Video Background */}
      <div className="absolute inset-0 z-0 select-none pointer-events-none overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 bg-black/50 z-10 backdrop-blur-[1px]"></div>
        <video 
            key={videoSrc}
            autoPlay 
            loop 
            muted 
            playsInline
            preload="auto"
            poster="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
            className={`w-full h-full object-cover scale-105 transition-opacity duration-1000 ${isGeneratingVideo ? 'opacity-50' : 'opacity-100'}`}
            style={{ filter: 'contrast(1.1) saturation(1.2)' }}
        >
            <source src={videoSrc} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505] via-transparent to-[#050505] z-10"></div>
      </div>

      {/* Veo Controls - Responsive Position */}
      <div className="absolute top-24 right-4 md:right-6 z-40">
          {isGeneratingVideo ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/80 rounded-full border border-vfm-lime/50 text-vfm-lime text-[10px] md:text-xs font-bold animate-pulse">
                  <Loader2 className="w-3 h-3 md:w-4 md:h-4 animate-spin" /> Generating Vibe...
              </div>
          ) : (
            <button onClick={() => setShowVideoPrompt(true)} className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full border border-white/10 text-white text-[10px] md:text-xs font-bold transition-all hover:scale-105 pointer-events-auto">
                <Video className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden xs:inline">Change Vibe (AI)</span><span className="xs:hidden">AI Vibe</span>
            </button>
          )}
      </div>

      {/* Video Prompt Modal */}
      {showVideoPrompt && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowVideoPrompt(false)} />
              <div className="relative bg-[#18181b] p-6 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl animate-pop">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Sparkles className="w-4 h-4 text-vfm-lime" /> Generate Background (Veo)</h3>
                  <textarea 
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-vfm-lime/50 focus:outline-none mb-4 h-24 resize-none"
                    placeholder="Describe your dream travel scene..."
                  />
                  <div className="flex justify-end gap-2">
                      <button onClick={() => setShowVideoPrompt(false)} className="px-4 py-2 text-zinc-400 hover:text-white text-xs font-bold">Cancel</button>
                      <button onClick={handleGenerateBackground} className="px-4 py-2 bg-vfm-lime text-black rounded-lg text-xs font-bold hover:bg-white transition-colors">Generate Video</button>
                  </div>
                  <p className="mt-3 text-[10px] text-zinc-500">Powered by Google Veo. Requires paid API key.</p>
              </div>
          </div>
      )}

      <div className="relative z-20 max-w-7xl mx-auto w-full">
        
        {/* Brand Logo Hero Section */}
        <div className="mb-10 md:mb-16">
            <BrandLogo size="hero" />
            
            {/* Dynamic Comparison Subheadline */}
            <div className="h-10 md:h-12 flex items-center justify-center mt-6 md:mt-8 overflow-hidden">
                <div key={subHeadlineIndex} className="text-lg md:text-2xl font-sans font-light text-zinc-300 animate-slide-up flex items-center gap-2 md:gap-3">
                    <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-vfm-lime"></span>
                    {COMPARISONS[subHeadlineIndex]}
                </div>
            </div>
        </div>

        {/* Lead Magnet */}
        <div className="max-w-2xl mx-auto mb-8 md:mb-12 animate-slide-up px-2" style={{ animationDelay: '100ms' }}>
            <div className={`relative p-[1px] rounded-3xl bg-gradient-to-r from-vfm-lime via-white to-vfm-purple transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] ${emailSubmitted ? 'opacity-75' : 'hover:scale-[1.02]'}`}>
                <div className="bg-[#121212]/90 backdrop-blur-xl rounded-[23px] p-5 md:p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-vfm-lime/10 rounded-full blur-3xl animate-pulse-fast"></div>
                    {!emailSubmitted ? (
                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
                            <div className="text-center md:text-left flex-1">
                                <div className="text-[10px] md:text-xs font-bold text-vfm-lime uppercase tracking-widest mb-1 flex items-center justify-center md:justify-start gap-2"><Sparkles className="w-3 h-3" /> Free Resource</div>
                                <h3 className="text-lg md:text-xl font-display font-bold text-white mb-1">The VFM Cheat Sheet</h3>
                                <p className="text-xs md:text-sm text-zinc-400">Unlock 50+ undiscovered budget hacks.</p>
                            </div>
                            <form onSubmit={handleEmailSubmit} className="flex-1 w-full flex gap-2">
                                <input type="email" placeholder="Email..." value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 text-white placeholder-zinc-500 px-4 py-2.5 md:py-3 rounded-xl focus:outline-none focus:border-vfm-lime/50 font-sans text-sm md:text-base" required />
                                <button type="submit" className="px-4 md:px-5 py-2.5 md:py-3 bg-white text-black font-bold rounded-xl hover:bg-vfm-lime transition-colors whitespace-nowrap text-sm md:text-base">Get It</button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center gap-3 text-green-400 py-2"><CheckSquare className="w-5 h-5" /><div className="text-base font-bold">Cheat Sheet Sent!</div></div>
                    )}
                </div>
            </div>
        </div>

        {/* Search Console - Responsive Grid Optimized */}
        <div className="max-w-6xl mx-auto relative group animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="absolute -inset-1 bg-gradient-to-r from-vfm-lime/20 via-vfm-purple/20 to-vfm-orange/20 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition duration-1000 animate-gradient-x"></div>
            <div className="relative bg-[#121212]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-10 shadow-2xl flex flex-col gap-6 md:gap-8">
                
                {/* Category Selector */}
                <div className="flex overflow-x-auto scrollbar-hide gap-3 pb-2 border-b border-white/5">
                    {CATEGORIES.map(cat => (
                        <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`relative flex-shrink-0 flex items-center gap-2 px-4 py-2 md:px-6 md:py-3 rounded-full text-sm md:text-base font-bold whitespace-nowrap transition-all font-sans overflow-hidden ${activeCategory === cat.id ? 'text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-transparent text-zinc-400 border border-zinc-800 hover:border-zinc-600'}`}>
                            {activeCategory === cat.id && <div className="absolute inset-0 bg-white z-0"></div>}
                            <div className="relative z-10 flex items-center gap-2">
                                <cat.icon className="w-4 h-4" />{cat.label}
                            </div>
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6 md:gap-8">
                    {/* Responsive Grid: Single column mobile, 12-col desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6">
                        {activeCategory === 'flights' ? (
                             <>
                                <div className="lg:col-span-3 relative group/input"><label className="text-xs uppercase font-bold text-zinc-500 mb-2 ml-1 block tracking-wider">From</label><input type="text" placeholder="Origin (City/Code)" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 md:h-14 px-4 text-white focus:outline-none focus:border-vfm-lime/50 transition-all font-sans text-base md:text-lg" /></div>
                                <div className="lg:col-span-3 relative group/input"><label className="text-xs uppercase font-bold text-zinc-500 mb-2 ml-1 block tracking-wider">To</label><input type="text" placeholder="Destination" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 md:h-14 px-4 text-white focus:outline-none focus:border-vfm-lime/50 transition-all font-sans text-base md:text-lg" /></div>
                             </>
                        ) : (
                            <div className="lg:col-span-4 relative group/input">
                                <label className="text-xs uppercase font-bold text-zinc-500 mb-2 ml-1 block tracking-wider">{activeCategory === 'rentals' ? 'Pick-up Location' : 'Where to?'}</label>
                                <div className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within/input:text-vfm-lime transition-colors" /><input type="text" placeholder="City, Region or Hack..." value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 md:h-14 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-vfm-lime/50 transition-all font-sans text-base md:text-lg focus:ring-1 ring-vfm-lime/50" /></div>
                            </div>
                        )}

                        <div className="lg:col-span-5 relative group/input">
                             <div className="flex justify-between items-center mb-2 ml-1">
                                <label className="text-xs uppercase font-bold text-zinc-500 block tracking-wider">Dates</label>
                                {activeCategory === 'flights' ? (
                                    <div className="flex bg-zinc-800 rounded-lg p-0.5"><button type="button" onClick={() => setTripType('oneway')} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${tripType === 'oneway' ? 'bg-white text-black' : 'text-zinc-500'}`}>One Way</button><button type="button" onClick={() => setTripType('roundtrip')} className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${tripType === 'roundtrip' ? 'bg-white text-black' : 'text-zinc-500'}`}>Round Trip</button></div>
                                ) : (
                                    <label className="flex items-center gap-1 cursor-pointer hover:opacity-80"><div className={`w-3 h-3 rounded-sm border ${isFlexible ? 'bg-vfm-lime border-vfm-lime' : 'border-zinc-600'} flex items-center justify-center`}>{isFlexible && <CheckSquare className="w-2.5 h-2.5 text-black" />}</div><input type="checkbox" checked={isFlexible} onChange={(e) => setIsFlexible(e.target.checked)} className="hidden" /><span className="text-xs text-zinc-400 font-medium">Flexible</span></label>
                                )}
                             </div>
                             <div className="flex gap-3">
                                 <div className="relative flex-1"><input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 md:h-14 px-3 md:px-4 text-xs md:text-sm text-white focus:outline-none focus:border-vfm-lime/50 transition-all font-sans [color-scheme:dark]" />{activeCategory === 'rentals' && (<input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-xs text-zinc-400 border-none focus:ring-0 w-16 text-right font-mono" />)}</div>
                                 <div className={`relative flex-1 transition-all ${activeCategory === 'flights' && tripType === 'oneway' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}><input type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 md:h-14 px-3 md:px-4 text-xs md:text-sm text-white focus:outline-none focus:border-vfm-lime/50 transition-all font-sans [color-scheme:dark]" />{activeCategory === 'rentals' && (<input type="time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-xs text-zinc-400 border-none focus:ring-0 w-16 text-right font-mono" />)}</div>
                             </div>
                        </div>

                        <div className={`${activeCategory === 'flights' ? 'lg:col-span-2' : 'lg:col-span-3'} relative group/input flex gap-2`}>
                            <div className="flex-1">
                                <label className="text-xs uppercase font-bold text-zinc-500 mb-2 ml-1 block tracking-wider">{activeCategory === 'rentals' ? 'Seats' : 'Pax'}</label>
                                <div className="relative"><Users className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-zinc-500 group-focus-within/input:text-vfm-lime transition-colors" /><select value={guests} onChange={(e) => setGuests(Number(e.target.value))} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 md:h-14 pl-10 md:pl-12 pr-4 text-white appearance-none cursor-pointer focus:outline-none focus:border-vfm-lime/50 transition-all font-sans text-base md:text-lg [&>option]:bg-zinc-900">{[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                            </div>
                            {activeCategory !== 'flights' && activeCategory !== 'rentals' && (
                                <div className="flex-1">
                                    <label className="text-xs uppercase font-bold text-zinc-500 mb-2 ml-1 block tracking-wider">Vibe</label>
                                    <div className="relative"><Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" /><select value={vibe} onChange={(e) => setVibe(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 md:h-14 pl-9 md:pl-10 pr-2 text-white appearance-none cursor-pointer focus:outline-none focus:border-vfm-lime/50 text-sm [&>option]:bg-zinc-900">{VIBES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}</select></div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 p-4 md:p-6 bg-zinc-900/30 rounded-2xl border border-white/5 items-center">
                        <div className="flex-1 w-full xl:border-r border-white/5 xl:pr-6">
                            <div className="flex justify-between items-center text-xs mb-3"><span className="text-zinc-400 font-medium flex items-center gap-1 font-sans"><IndianRupee className="w-3 h-3"/> Max Budget</span><span className="text-white font-bold font-sans">₹{maxPrice.toLocaleString()}</span></div>
                            <input type="range" min="1000" max="100000" step="1000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-vfm-lime [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all" />
                        </div>
                        <div className="grid grid-cols-3 gap-2 md:gap-4 w-full xl:w-auto">
                             <div onClick={() => setSquadTrip(!squadTrip)} className={`group relative overflow-hidden rounded-xl border cursor-pointer transition-all p-2 md:p-3 flex flex-col justify-center ${squadTrip ? 'bg-vfm-orange/10 border-vfm-orange/50' : 'bg-transparent border-zinc-700 hover:border-zinc-500'}`}>
                                <div className="flex items-center gap-1 md:gap-2 mb-1"><PartyPopper className={`w-3 h-3 md:w-4 md:h-4 ${squadTrip ? 'text-vfm-orange' : 'text-zinc-600'}`} /><span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${squadTrip ? 'text-white' : 'text-zinc-400'}`}>Squad</span></div>
                             </div>
                             <div onClick={() => setWorkation(!workation)} className={`group relative overflow-hidden rounded-xl border cursor-pointer transition-all p-2 md:p-3 flex flex-col justify-center ${workation ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-transparent border-zinc-700 hover:border-zinc-500'}`}>
                                <div className="flex items-center gap-1 md:gap-2 mb-1"><Wifi className={`w-3 h-3 md:w-4 md:h-4 ${workation ? 'text-cyan-500' : 'text-zinc-600'}`} /><span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${workation ? 'text-white' : 'text-zinc-400'}`}>Work</span></div>
                             </div>
                             <div onClick={() => setVwwRecommended(!vwwRecommended)} className={`group relative overflow-hidden rounded-xl border cursor-pointer transition-all p-2 md:p-3 flex flex-col justify-center ${vwwRecommended ? 'bg-vfm-lime/10 border-vfm-lime/50' : 'bg-transparent border-zinc-700 hover:border-zinc-500'}`}>
                                <div className="flex items-center gap-1 md:gap-2 mb-1"><ShieldCheck className={`w-3 h-3 md:w-4 md:h-4 ${vwwRecommended ? 'text-vfm-lime' : 'text-zinc-600'}`} /><span className={`text-[9px] md:text-[10px] font-bold uppercase tracking-wider ${vwwRecommended ? 'text-white' : 'text-zinc-400'}`}>VWW+</span></div>
                             </div>
                        </div>
                        <button type="submit" disabled={isSearching} className="w-full xl:w-auto px-6 md:px-10 py-3 md:py-4 bg-white hover:bg-vfm-lime text-black font-display font-bold text-base md:text-lg rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-w-[140px] md:min-w-[180px]">
                            {isSearching ? <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /><span>Scanning...</span></> : <>Search <ArrowRight className="w-5 h-5" /></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};