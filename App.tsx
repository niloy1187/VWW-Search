import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { HotelCard } from './components/HotelCard';
import { TravelCard } from './components/TravelCard';
import { MapView } from './components/MapView';
import { HotelDetailsModal } from './components/HotelDetailsModal';
import { BookingModal } from './components/BookingModal';
import { LeadGenCard } from './components/LeadGenCard';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ChatAssistant } from './components/ChatAssistant';
import { searchTravel } from './services/geminiService';
import { Hotel, SearchParams, GroundingChunk, UserStats, Quest, SearchResult } from './types';
import { Map, Grid2X2, SlidersHorizontal, Zap, Filter, Check, Flame, Trophy, Coins, X, Crown, Mail, Radar } from 'lucide-react';

const INITIAL_QUESTS: Quest[] = [
    { id: 'q1', title: 'Weekend Warrior', description: 'Search for a Fri-Sun trip', progress: 0, goal: 1, reward: 200, completed: false, icon: 'Flame' },
    { id: 'q2', title: 'Squad Goals', description: 'Find a Squad Friendly stay', progress: 0, goal: 1, reward: 500, completed: false, icon: 'Users' },
    { id: 'q3', title: 'Deal Hunter', description: 'Request Booking on a VFM stay', progress: 0, goal: 1, reward: 1000, completed: false, icon: 'Coins' }
];

const App: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Initializing VFM Engine...");
  
  // Search Context
  const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams | null>(null);

  // Modal & Selection State
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [bookingItem, setBookingItem] = useState<SearchResult | null>(null);
  
  const [showLeadGen, setShowLeadGen] = useState(false);
  
  // Local Filter State
  const [activeFilters, setActiveFilters] = useState({ sort: 'vfm' });
  
  // Gamification
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 0, level: 1, badges: ['Novice'], searches: 0, streak: 1, quests: INITIAL_QUESTS
  });
  const [xpNotification, setXpNotification] = useState<{ amount: number; message: string } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => console.log("Loc denied")
      );
    }
  }, []);

  const awardXP = (amount: number, message: string) => {
    setUserStats(prev => {
        const newXP = prev.xp + amount;
        return { ...prev, xp: newXP, level: Math.floor(newXP / 1000) + 1 };
    });
    setXpNotification({ amount, message });
    setTimeout(() => setXpNotification(null), 3000);
  };

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setCurrentSearchParams(params);
    setResults([]); 
    setGroundingChunks([]);
    setHasSearched(true);
    setViewMode('list');
    
    // Dynamic Loading Text
    const loadingMessages = [
        `Accessing ${params.category} inventory...`,
        "Analysing VFM Scores...",
        "Identifying Squad-friendly options...",
        "Unlocking secret hacks..."
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
        setLoadingMsg(loadingMessages[msgIdx % loadingMessages.length]);
        msgIdx++;
    }, 1200);

    setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100);

    awardXP(50, "Smart Search");
    setUserStats(prev => ({ ...prev, searches: prev.searches + 1 }));

    try {
      // Stream results one by one for instant population
      const { groundingChunks: chunks } = await searchTravel(
        params, 
        userLocation,
        (foundResult) => {
            setResults(prev => {
                // Prevent duplicates based on name collision
                if (prev.some(h => h.name === foundResult.name)) return prev;
                return [...prev, foundResult];
            });
        }
      );
      
      setGroundingChunks(chunks);

      // Silently update existing results with grounding URLs without causing a layout shift
      setResults(prevResults => {
          return prevResults.map(res => {
              const match = chunks.find((chunk: any) => 
                (chunk.maps?.title && res.name.toLowerCase().includes(chunk.maps.title.toLowerCase())) ||
                (chunk.web?.title && chunk.web.title.toLowerCase().includes(res.name.toLowerCase()))
              );
              return {
                  ...res,
                  groundingUrl: match?.maps?.uri || match?.web?.uri
              };
          });
      });

    } catch (error) {
      console.error(error);
    } finally {
      setIsSearching(false);
      clearInterval(msgInterval);
    }
  };

  const handleInteraction = (type: 'view' | 'book' | 'save' | 'unlock', itemId?: string) => {
      if (type === 'book') {
          const item = results.find(h => h.id === itemId);
          if (item) setBookingItem(item);
      } else if (type === 'save') {
          awardXP(10, "Saved to Wishlist");
      } else if (type === 'unlock') {
          setShowLeadGen(true);
      } else if (type === 'view') {
          const item = results.find(h => h.id === itemId);
          if (item) setSelectedResult(item); 
      }
  };

  const unlockDeal = (e: React.FormEvent) => {
      e.preventDefault();
      setResults(prev => prev.map(h => ({ ...h, isSecretDeal: false })));
      setShowLeadGen(false);
      awardXP(200, "Unlocked!");
  };

  const handleBookingSubmit = (formData: any) => {
      // Simulate submission to backend
      console.log("Booking Payload:", formData);
      awardXP(500, "Booking Requested!");
      // We purposefully keep bookingItem set so the modal can show the success state.
      // The user will close the modal manually via the success screen.
  };

  // Sort Logic
  const sortedResults = [...results].sort((a, b) => {
      if (activeFilters.sort === 'price-asc') return (parseInt(a.bookingOptions[0].price.replace(/[^0-9]/g, '')) || 0) - (parseInt(b.bookingOptions[0].price.replace(/[^0-9]/g, '')) || 0);
      return (b.vfmScore || 0) - (a.vfmScore || 0);
  });

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-vfm-lime/30 selection:text-vfm-lime overflow-x-hidden">
      
      <ChatAssistant />

      {/* Lightbox Modal */}
      {selectedResult && selectedResult.type === 'stay' && (
          <HotelDetailsModal 
              hotel={selectedResult as Hotel} 
              onClose={() => setSelectedResult(null)} 
              onBook={() => {
                  setSelectedResult(null); 
                  handleInteraction('book', selectedResult.id); 
              }}
          />
      )}

      {/* Booking Modal */}
      {bookingItem && (
          <BookingModal 
              hotel={bookingItem}
              searchParams={currentSearchParams}
              onClose={() => setBookingItem(null)}
              onSubmit={handleBookingSubmit}
          />
      )}

      {/* XP Notification */}
      {xpNotification && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-up pointer-events-none w-full max-w-sm px-4">
              <div className="bg-vfm-lime text-black px-6 py-3 rounded-2xl font-bold shadow-[0_0_40px_rgba(204,255,0,0.4)] flex items-center justify-between border-2 border-white">
                  <div className="flex items-center gap-2"><Zap className="w-5 h-5 fill-black" /><span>{xpNotification.message}</span></div>
                  <span className="font-mono">+{xpNotification.amount}</span>
              </div>
          </div>
      )}

      {/* Lead Gen Modal */}
      {showLeadGen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLeadGen(false)} />
              <div className="relative bg-[#18181b] border border-vfm-lime/30 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-pop">
                  <button onClick={() => setShowLeadGen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
                  <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-vfm-lime/10 rounded-full flex items-center justify-center border border-vfm-lime/20"><Crown className="w-8 h-8 text-vfm-lime" /></div></div>
                  <h2 className="text-2xl font-display font-bold text-center text-white mb-2">Unlock Exclusive Deals</h2>
                  <form onSubmit={unlockDeal} className="space-y-4">
                      <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" /><input type="email" placeholder="Enter your email" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-vfm-lime/50 focus:outline-none" required /></div>
                      <button type="submit" className="w-full bg-vfm-lime hover:bg-white text-black font-bold py-3 rounded-xl transition-all uppercase tracking-wide">Unlock Free</button>
                  </form>
              </div>
          </div>
      )}

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 h-20 flex items-center transition-all duration-300">
        <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.location.reload()}>
                <div className="w-10 h-10 bg-vfm-lime rounded-xl flex items-center justify-center transform -rotate-6 shadow-lg shadow-vfm-lime/20 group-hover:rotate-0 transition-transform">
                    <span className="text-black font-display font-black text-xl">W</span>
                </div>
                <div className="leading-none">
                    <div className="font-display font-bold text-xl text-white tracking-tight group-hover:text-vfm-lime transition-colors">Value WanderWeavers</div>
                    <div className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest flex items-center gap-1"><span className="text-vfm-lime">●</span> By Palate Pilgrim</div>
                </div>
            </div>
            <div className="flex items-center gap-4 md:gap-6">
                <button onClick={() => setShowLeadGen(true)} className="hidden md:flex px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider transition-all items-center gap-2 hover:border-vfm-lime/50 hover:text-vfm-lime"><Crown className="w-3 h-3 text-vfm-lime" /> Member Login</button>
                <div className="hidden md:flex flex-col items-end"><div className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Smart Cred</div><div className="font-mono text-vfm-lime font-bold">{userStats.xp} XP</div></div>
            </div>
        </div>
      </nav>

      <Hero onSearch={handleSearch} isSearching={isSearching} userStats={userStats} />

      {/* Results */}
      {hasSearched && (
        <section id="results-section" className="relative z-20 px-4 md:px-6 py-12 max-w-7xl mx-auto min-h-screen scroll-mt-24">
            
            <div className="sticky top-24 z-30 bg-[#050505]/90 backdrop-blur-md p-4 rounded-2xl border border-white/5 mb-8 shadow-2xl flex flex-wrap gap-4 items-center justify-between transition-all duration-300">
                <h2 className="text-xl font-display font-bold text-white flex items-center gap-3">
                    {isSearching ? <div className="w-3 h-3 bg-vfm-lime rounded-full animate-pulse"/> : <Check className="w-4 h-4 text-vfm-lime"/>}
                    {isSearching ? <span className="animate-pulse">Sourcing Deals...</span> : `Found ${results.length} Options`}
                </h2>
                
                <div className="flex items-center gap-2">
                    <button onClick={() => setShowFilters(!showFilters)} className={`px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 transition-all ${showFilters ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-white'}`}><SlidersHorizontal className="w-4 h-4" /> Filters</button>
                    {currentSearchParams?.category === 'stays' && (
                        <>
                            <div className="h-8 w-px bg-white/10 mx-2" />
                            <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Grid2X2 className="w-5 h-5"/></button>
                            <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Map className="w-5 h-5"/></button>
                        </>
                    )}
                </div>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="mb-8 p-6 bg-zinc-900/50 rounded-2xl border border-white/5 animate-fade-in backdrop-blur-sm">
                    <div className="flex gap-2">
                        {['vfm', 'price-asc'].map(opt => (
                            <button key={opt} onClick={() => setActiveFilters({...activeFilters, sort: opt})} className={`px-4 py-2 rounded-full text-xs font-bold border ${activeFilters.sort === opt ? 'bg-vfm-lime text-black border-vfm-lime' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-white transition-colors'}`}>
                                {opt === 'vfm' ? 'Best VFM Score' : 'Cheapest First'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-8">
                {viewMode === 'list' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sortedResults.map((item, index) => (
                             item.type === 'stay' ? (
                                <HotelCard 
                                    key={item.id} 
                                    hotel={item as Hotel} 
                                    index={index} 
                                    onInteract={(type) => handleInteraction(type, item.id)}
                                />
                             ) : (
                                <TravelCard 
                                    key={item.id}
                                    item={item}
                                    index={index}
                                    onInteract={(type) => handleInteraction(type, item.id)}
                                />
                             )
                        ))}

                        {/* Loading States */}
                        {isSearching && (
                            <>
                                {/* Initial Load: Fill grid with skeletons */}
                                {results.length === 0 && Array.from({ length: 3 }).map((_, i) => (
                                    <LoadingSkeleton key={`skel-init-${i}`} message={i === 0 ? loadingMsg : undefined} />
                                ))}
                                
                                {/* Streaming Load: Append one skeleton at the end to show more are coming */}
                                {results.length > 0 && (
                                    <LoadingSkeleton message={loadingMsg} />
                                )}
                            </>
                        )}
                        
                        {!isSearching && <LeadGenCard />}
                    </div>
                ) : (
                    <div className="h-[70vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        <MapView hotels={results as Hotel[]} />
                    </div>
                )}
            </div>
            
            {/* Grounding Footer */}
            {!isSearching && groundingChunks.length > 0 && (
                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <p className="text-xs text-zinc-600 font-mono mb-4">DATA VERIFIED BY VFM ENGINE</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {groundingChunks.slice(0, 5).map((chunk, i) => (
                            <a key={i} href={chunk.web?.uri || chunk.maps?.uri} target="_blank" className="text-[10px] text-zinc-500 hover:text-vfm-lime underline decoration-zinc-700 transition-colors">
                                {chunk.web?.title || chunk.maps?.title}
                            </a>
                        ))}
                    </div>
                </div>
            )}

        </section>
      )}

    </div>
  );
};

export default App;