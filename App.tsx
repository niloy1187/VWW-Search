import React, { useState, useEffect, useMemo } from 'react';
import { Hero } from './components/Hero';
import { HotelCard } from './components/HotelCard';
import { TravelCard } from './components/TravelCard';
import { MapView } from './components/MapView';
import { HotelDetailsModal } from './components/HotelDetailsModal';
import { BookingModal } from './components/BookingModal';
import { LeadGenCard } from './components/LeadGenCard';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { ChatAssistant } from './components/ChatAssistant';
import { GamificationHub } from './components/GamificationHub';
import { BrandLogo } from './components/BrandLogo';
import { ShareModal } from './components/ShareModal';
import { searchTravel } from './services/geminiService';
import { Hotel, SearchParams, GroundingChunk, UserStats, Quest, SearchResult } from './types';
import { Map, Grid2X2, Zap, Check, ShieldCheck, Filter, ChevronDown, Crown, Mail, X, AlertCircle, Heart, Home, ArrowLeft } from 'lucide-react';

const INITIAL_QUESTS: Quest[] = [
    { id: 'q1', title: 'Weekend Warrior', description: 'Search for a Fri-Sun trip', progress: 0, goal: 1, reward: 200, completed: false, icon: 'Flame' },
    { id: 'q2', title: 'Squad Goals', description: 'Find a Squad Friendly stay', progress: 0, goal: 1, reward: 500, completed: false, icon: 'Users' },
    { id: 'q3', title: 'Deal Hunter', description: 'Request Booking on a VFM stay', progress: 0, goal: 1, reward: 1000, completed: false, icon: 'Coins' }
];

interface FilterState {
    sort: 'vfm' | 'price-asc' | 'rating-desc';
    minRating: number;
    maxPrice: number;
    amenities: string[];
    stops: string;
    transmission: string;
}

const App: React.FC = () => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [savedItems, setSavedItems] = useState<SearchResult[]>(() => {
      try {
          const saved = localStorage.getItem('vww-saved');
          return saved ? JSON.parse(saved) : [];
      } catch (e) { return []; }
  });
  
  const [isSearching, setIsSearching] = useState(false);
  const [groundingChunks, setGroundingChunks] = useState<GroundingChunk[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'saved'>('list');
  const [showFilters, setShowFilters] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("Initializing VFM Engine...");
  
  const [showLeadGen, setShowLeadGen] = useState(false);
  const [showGamification, setShowGamification] = useState(false);
  const [currentSearchParams, setCurrentSearchParams] = useState<SearchParams | null>(null);
  
  // Modal States
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [bookingItem, setBookingItem] = useState<SearchResult | null>(null);
  const [shareItem, setShareItem] = useState<SearchResult | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({ 
      sort: 'vfm', minRating: 0, maxPrice: 100000, amenities: [], stops: 'any', transmission: 'any'
  });
  
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
    setFilters(prev => ({ ...prev, maxPrice: params.maxPrice || 100000 }));
    
    setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 100);

    const loadingMessages = [
        `Accessing ${params.category} inventory...`,
        "Auditing VFM Scores...",
        "Scraping competitor rates...",
        "Unlocking secret hacks..."
    ];
    let msgIdx = 0;
    const msgInterval = setInterval(() => {
        setLoadingMsg(loadingMessages[msgIdx % loadingMessages.length]);
        msgIdx++;
    }, 1500); 

    awardXP(50, "Smart Search");
    setUserStats(prev => ({ ...prev, searches: prev.searches + 1 }));
    
    try {
      const { results: foundResults, groundingChunks: chunks } = await searchTravel(params, userLocation);
      setResults(foundResults || []);
      setGroundingChunks(chunks || []);
    } catch (error) {
      console.error(error);
      setResults([]);
      setGroundingChunks([]);
    } finally {
      setIsSearching(false);
      clearInterval(msgInterval);
    }
  };

  const toggleSave = (item: SearchResult) => {
      setSavedItems(prev => {
          const exists = prev.find(i => i.id === item.id);
          let newItems;
          if (exists) {
              newItems = prev.filter(i => i.id !== item.id);
          } else {
              newItems = [...prev, item];
              awardXP(10, "Saved to Wishlist");
          }
          localStorage.setItem('vww-saved', JSON.stringify(newItems));
          return newItems;
      });
  };

  const handleInteraction = (type: 'view' | 'book' | 'save' | 'unlock' | 'share', itemId?: string) => {
      // Find item in results OR saved items
      const item = results.find(h => h.id === itemId) || savedItems.find(h => h.id === itemId);
      
      if (type === 'book' && item) {
          setBookingItem(item);
      } else if (type === 'save' && item) {
          toggleSave(item);
      } else if (type === 'unlock') {
          setShowLeadGen(true);
      } else if (type === 'view' && item) {
          setSelectedResult(item); 
      } else if (type === 'share' && item) {
          setShareItem(item);
          awardXP(20, "Shared Deal");
      }
  };

  const activeList = viewMode === 'saved' ? savedItems : results;

  const filteredAndSortedResults = useMemo(() => {
    return activeList
      .filter(item => {
          if (viewMode === 'saved') return true; // Less strict filtering for saved items
          
          const rawPrice = item.bookingOptions?.[0]?.price;
          const priceStr = String(rawPrice || '0').replace(/[^0-9]/g, '');
          const price = parseInt(priceStr || '0');
          
          if (price < 100) return false;
          if (price > filters.maxPrice) return false;
          if ((item.rating || 0) < filters.minRating) return false;

          if (currentSearchParams?.category === 'flights' && filters.stops !== 'any') {
              const flight = item as any;
              if (filters.stops === 'direct' && flight.stops > 0) return false;
              if (filters.stops === '1stop' && flight.stops !== 1) return false;
          }
          if (currentSearchParams?.category === 'rentals' && filters.transmission !== 'any') {
              const rental = item as any;
              if (rental.transmission !== filters.transmission) return false;
          }
          return true;
      })
      .sort((a, b) => {
        if (filters.sort === 'price-asc') {
            const priceA = parseInt(String(a.bookingOptions?.[0]?.price || '0').replace(/[^0-9]/g, '') || '0');
            const priceB = parseInt(String(b.bookingOptions?.[0]?.price || '0').replace(/[^0-9]/g, '') || '0');
            return priceA - priceB;
        }
        if (filters.sort === 'rating-desc') return (b.rating || 0) - (a.rating || 0);
        return (b.vfmScore || 0) - (a.vfmScore || 0);
      });
  }, [activeList, filters, currentSearchParams, viewMode]);


  return (
    <div className="min-h-screen bg-transparent text-zinc-100 font-sans selection:bg-vfm-lime/30 selection:text-vfm-lime overflow-x-hidden relative">
      <ChatAssistant />
      {showGamification && <GamificationHub stats={userStats} onClose={() => setShowGamification(false)} />}
      
      {/* Modals */}
      {selectedResult && <HotelDetailsModal hotel={selectedResult} onClose={() => setSelectedResult(null)} onBook={() => { setSelectedResult(null); handleInteraction('book', selectedResult.id); }} onShare={() => { handleInteraction('share', selectedResult.id); }} />}
      {bookingItem && <BookingModal hotel={bookingItem} searchParams={currentSearchParams} onClose={() => setBookingItem(null)} onSubmit={(d) => { console.log(d); awardXP(500, "Booking Requested!"); }} />}
      {shareItem && <ShareModal item={shareItem} onClose={() => setShareItem(null)} />}
      
      {xpNotification && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] animate-slide-up pointer-events-none w-full max-w-sm px-4">
              <div className="bg-vfm-lime text-black px-6 py-3 rounded-2xl font-bold shadow-[0_0_40px_rgba(204,255,0,0.4)] flex items-center justify-between border-2 border-white">
                  <div className="flex items-center gap-2"><Zap className="w-5 h-5 fill-black" /><span>{xpNotification.message}</span></div>
                  <span className="font-mono">+{xpNotification.amount}</span>
              </div>
          </div>
      )}

      {showLeadGen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
              <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowLeadGen(false)} />
              <div className="relative bg-[#18181b] border border-vfm-lime/30 rounded-3xl p-8 max-w-md w-full shadow-2xl animate-pop">
                  <button onClick={() => setShowLeadGen(false)} className="absolute top-4 right-4 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
                  <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-vfm-lime/10 rounded-full flex items-center justify-center border border-vfm-lime/20"><Crown className="w-8 h-8 text-vfm-lime" /></div></div>
                  <h2 className="text-2xl font-display font-bold text-center text-white mb-2">Unlock Exclusive Deals</h2>
                  <p className="text-center text-zinc-400 mb-4 text-sm">Join 20,000+ members saving huge on travel.</p>
                  <form onSubmit={(e) => { e.preventDefault(); setResults(prev => prev.map(h => ({ ...h, isSecretDeal: false }))); setShowLeadGen(false); awardXP(200, "Unlocked Secret Deal"); }} className="space-y-4">
                      <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" /><input type="email" placeholder="Enter your email" className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-vfm-lime/50 focus:outline-none" required /></div>
                      <button type="submit" className="w-full bg-vfm-lime hover:bg-white text-black font-bold py-3 rounded-xl transition-all uppercase tracking-wide">Unlock Free</button>
                  </form>
              </div>
          </div>
      )}

      <nav className="fixed top-0 inset-x-0 z-50 bg-[#050505]/60 backdrop-blur-xl border-b border-white/5 h-16 md:h-20 flex items-center transition-all duration-300">
        <div className="max-w-7xl mx-auto w-full px-4 md:px-6 flex justify-between items-center">
            <div onClick={() => window.location.reload()} className="cursor-pointer">
                <BrandLogo size="sm" />
            </div>
            <div className="flex items-center gap-3 md:gap-6">
                 {/* Saved Items Toggle */}
                 <button 
                    onClick={() => {
                        if (viewMode === 'saved') {
                            setViewMode('list'); 
                            if (!hasSearched) document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' });
                        } else {
                            setViewMode('saved');
                            setHasSearched(true);
                        }
                    }} 
                    className={`relative p-2 md:px-4 md:py-2 rounded-full border transition-all flex items-center gap-2 ${viewMode === 'saved' ? 'bg-vfm-lime text-black border-vfm-lime' : 'bg-zinc-900 text-zinc-400 border-white/10 hover:text-white'}`}
                 >
                    <Heart className={`w-5 h-5 ${viewMode === 'saved' ? 'fill-black' : ''}`} />
                    <span className="hidden md:inline font-bold text-xs uppercase tracking-wider">Saved</span>
                    {savedItems.length > 0 && <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] flex items-center justify-center font-bold ${viewMode === 'saved' ? 'bg-black text-white' : 'bg-vfm-lime text-black'}`}>{savedItems.length}</span>}
                 </button>

                <button onClick={() => setShowLeadGen(true)} className="hidden md:flex px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold uppercase tracking-wider transition-all items-center gap-2 hover:border-vfm-lime/50 hover:text-vfm-lime"><Crown className="w-3 h-3 text-vfm-lime" /> Member Login</button>
                <button onClick={() => setShowGamification(true)} className="flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-vfm-lime/50 transition-all cursor-pointer group shadow-lg">
                    <div className="flex flex-col items-end"><div className="hidden md:block text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Travel Cred</div><div className="font-mono text-vfm-lime font-bold text-xs md:text-sm">{userStats.xp} XP</div></div>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-vfm-lime to-vfm-purple p-[1px]"><div className="w-full h-full bg-black rounded-full flex items-center justify-center"><ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-white group-hover:text-vfm-lime transition-colors" /></div></div>
                </button>
            </div>
        </div>
      </nav>

      <div id="hero-section">
        {viewMode !== 'saved' && <Hero onSearch={handleSearch} isSearching={isSearching} userStats={userStats} />}
      </div>

      {(hasSearched || viewMode === 'saved') && (
        <section id="results-section" className="relative z-20 px-4 md:px-6 py-8 md:py-12 max-w-7xl mx-auto min-h-screen scroll-mt-24">
            
            <div className="sticky top-20 md:top-24 z-30 bg-[#050505]/90 backdrop-blur-md p-4 rounded-2xl border border-white/5 mb-8 shadow-2xl flex flex-col md:flex-row gap-4 items-start md:items-center justify-between transition-all duration-300 animate-slide-down">
                <div className="flex items-center gap-3">
                    {viewMode === 'saved' && (
                        <button onClick={() => setViewMode('list')} className="p-2 rounded-lg bg-zinc-800 text-white hover:bg-zinc-700 transition-colors"><ArrowLeft className="w-5 h-5" /></button>
                    )}
                    <h2 className="text-lg md:text-xl font-display font-bold text-white flex items-center gap-3">
                        {isSearching ? <div className="w-3 h-3 bg-vfm-lime rounded-full animate-pulse"/> : (viewMode === 'saved' ? <Heart className="w-5 h-5 text-vfm-lime fill-vfm-lime" /> : <Check className="w-4 h-4 text-vfm-lime"/>)}
                        {isSearching ? <span className="animate-pulse">Deep Auditing Deals...</span> : (viewMode === 'saved' ? `Your Wishlist (${savedItems.length})` : `Found ${filteredAndSortedResults.length} VFM Options`)}
                    </h2>
                </div>
                
                <div className="flex items-center gap-2 w-full md:w-auto">
                    {viewMode !== 'saved' && (
                        <>
                            <button onClick={() => setShowFilters(!showFilters)} className={`flex-1 md:flex-none justify-center px-4 py-2 rounded-lg border text-sm font-bold flex items-center gap-2 transition-all ${showFilters ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-white'}`}><Filter className="w-4 h-4" /> Filters {showFilters ? <ChevronDown className="w-3 h-3 rotate-180 transition-transform" /> : <ChevronDown className="w-3 h-3" />}</button>
                            {currentSearchParams?.category === 'stays' && (
                                <>
                                    <div className="h-8 w-px bg-white/10 mx-2" />
                                    <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Grid2X2 className="w-5 h-5"/></button>
                                    <button onClick={() => setViewMode('map')} className={`p-2 rounded-lg ${viewMode === 'map' ? 'bg-zinc-800 text-white' : 'text-zinc-500'}`}><Map className="w-5 h-5"/></button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>

            {showFilters && viewMode !== 'saved' && (
                <div className="mb-8 p-6 bg-zinc-900/50 rounded-2xl border border-white/5 animate-fade-in backdrop-blur-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Sort By</label>
                        <select value={filters.sort} onChange={(e) => setFilters({...filters, sort: e.target.value as any})} className="bg-black border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-vfm-lime/50 appearance-none">
                            <option value="vfm">Best VFM Score</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="rating-desc">Rating: High to Low</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-2">
                         <div className="flex justify-between items-center"><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Max Budget</label><span className="text-vfm-lime text-xs font-bold">₹{filters.maxPrice.toLocaleString()}</span></div>
                         <input type="range" min="1000" max="100000" step="1000" value={filters.maxPrice} onChange={(e) => setFilters({...filters, maxPrice: Number(e.target.value)})} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full" />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Min Rating</label>
                        <div className="flex gap-2">
                            {[0, 3, 4, 5].map(r => (<button key={r} onClick={() => setFilters({...filters, minRating: r})} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${filters.minRating === r ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700'}`}>{r === 0 ? 'Any' : `${r}+ ★`}</button>))}
                        </div>
                    </div>
                    {currentSearchParams?.category === 'flights' && (<div className="flex flex-col gap-2"><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Stops</label><div className="flex gap-2">{['any', 'direct', '1stop'].map(opt => (<button key={opt} onClick={() => setFilters({...filters, stops: opt})} className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border ${filters.stops === opt ? 'bg-vfm-lime text-black border-vfm-lime' : 'border-zinc-700 text-zinc-400'}`}>{opt}</button>))}</div></div>)}
                    {currentSearchParams?.category === 'rentals' && (<div className="flex flex-col gap-2"><label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Transmission</label><div className="flex gap-2">{['any', 'Automatic', 'Manual'].map(opt => (<button key={opt} onClick={() => setFilters({...filters, transmission: opt})} className={`flex-1 py-2 rounded-lg text-xs font-bold capitalize border ${filters.transmission === opt ? 'bg-vfm-lime text-black border-vfm-lime' : 'border-zinc-700 text-zinc-400'}`}>{opt === 'any' ? 'Any' : opt}</button>))}</div></div>)}
                </div>
            )}

            <div className="flex flex-col gap-8">
                {viewMode === 'list' || viewMode === 'saved' ? (
                    // Responsive Grid: 1 col mobile, 2 cols tablet, 3/4 cols desktop
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredAndSortedResults.map((item, index) => {
                             const isSaved = savedItems.some(i => i.id === item.id);
                             return item.type === 'stay' ? 
                                <HotelCard key={item.id} hotel={item as Hotel} index={index} isSaved={isSaved} onInteract={(type) => handleInteraction(type, item.id)} /> : 
                                <TravelCard key={item.id} item={item} index={index} isSaved={isSaved} onInteract={(type) => handleInteraction(type, item.id)} />
                        })}
                        {isSearching && Array.from({ length: 4 }).map((_, i) => (<LoadingSkeleton key={`skel-${i}`} message={i === 0 && results.length === 0 ? loadingMsg : undefined} />))}
                        {!isSearching && results.length > 0 && viewMode === 'list' && <LeadGenCard />}
                        {!isSearching && filteredAndSortedResults.length === 0 && (
                            <div className="col-span-full py-16 flex flex-col items-center justify-center text-zinc-500 border-2 border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
                                {viewMode === 'saved' ? (
                                    <>
                                        <Heart className="w-12 h-12 text-zinc-700 mb-4" />
                                        <div className="text-2xl font-display font-bold text-white mb-2">Your wishlist is empty</div>
                                        <p className="mb-6 max-w-md text-center">Start searching to find high VFM deals and save them here.</p>
                                        <button onClick={() => setViewMode('list')} className="px-6 py-3 bg-white text-black font-bold rounded-xl uppercase tracking-wider hover:bg-vfm-lime transition-colors">Start Searching</button>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-12 h-12 text-zinc-600 mb-4" />
                                        <div className="text-2xl font-display font-bold text-white mb-2">No results found</div>
                                        <p className="mb-6 max-w-md text-center">Our strict VFM Engine filtered out 0 low-quality options. Try adjusting your price range or location.</p>
                                        <button onClick={() => setFilters({ ...filters, maxPrice: 100000, minRating: 0 })} className="px-6 py-3 bg-white text-black font-bold rounded-xl uppercase tracking-wider hover:bg-vfm-lime transition-colors">Reset Filters</button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="h-[70vh] rounded-3xl overflow-hidden border border-white/10 shadow-2xl"><MapView hotels={results as Hotel[]} /></div>
                )}
            </div>
            
            {!isSearching && groundingChunks.length > 0 && viewMode === 'list' && (
                <div className="mt-16 pt-8 border-t border-white/10 text-center">
                    <p className="text-xs text-zinc-600 font-mono mb-4">DATA VERIFIED BY VFM ENGINE</p>
                    <div className="flex flex-wrap justify-center gap-2">
                        {groundingChunks.slice(0, 5).map((chunk, i) => (<a key={i} href={chunk.web?.uri || chunk.maps?.uri} target="_blank" className="text-[10px] text-zinc-500 hover:text-vfm-lime underline">{chunk.web?.title || chunk.maps?.title}</a>))}
                    </div>
                </div>
            )}
        </section>
      )}
    </div>
  );
};

export default App;