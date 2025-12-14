import React, { useState, useEffect } from 'react';
import { Hotel } from '../types';
import { Star, MapPin, Users, Heart, Lock, ArrowUpRight, ExternalLink, Share2, Info, Bell, Activity, Zap } from 'lucide-react';
import { getSmartFallbackImage } from '../services/geminiService';

interface HotelCardProps {
  hotel: Hotel;
  index: number;
  isSaved?: boolean;
  onInteract: (type: 'view' | 'book' | 'save' | 'unlock' | 'share') => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, index, isSaved = false, onInteract }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [imgSrc, setImgSrc] = useState(hotel.imageUrl);
  const [hasError, setHasError] = useState(false);
  
  // Reset image if hotel changes
  useEffect(() => {
      setImgSrc(hotel.imageUrl);
      setHasError(false);
  }, [hotel.id]); // Key on ID for stability

  const priceDisplay = String(hotel.bookingOptions?.[0]?.price || "Check Price");
  const provider = hotel.bookingOptions?.[0]?.provider || "Direct";
  const marketPrice = hotel.marketPrice || hotel.bookingOptions?.[hotel.bookingOptions.length-1]?.price;
  const discount = hotel.bookingOptions?.[0]?.discount;
  const isLocked = hotel.isSecretDeal;
  const score = hotel.vfmScore || 8.5;
  
  // Meta-Search Comparison Logic
  const allOptions = hotel.bookingOptions || [];
  
  const handleError = () => { 
      if (!hasError) { 
          setHasError(true); 
          setImgSrc(getSmartFallbackImage('stay', hotel.name, hotel.location)); 
      } 
  };
  
  // Safe string cleaning for prices
  const cleanPrice = parseInt(priceDisplay.replace(/[^0-9]/g, '') || '0');
  const cleanMarket = parseInt(String(marketPrice || '0').replace(/[^0-9]/g, '') || '0');
  const savingsAmount = Math.max(0, cleanMarket - cleanPrice);
  
  // Dynamic VFM Circle Config
  const radius = 20; 
  const circumference = 2 * Math.PI * radius; 
  const offset = circumference - (score / 10) * circumference;
  let scoreColor = score >= 8 ? '#ccff00' : score >= 6 ? '#facc15' : '#ef4444';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isLocked && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onInteract('view');
    }
  };

  return (
    <div 
      onClick={() => !isLocked && onInteract('view')} 
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={isLocked ? -1 : 0}
      aria-label={`View details for ${hotel.name}`}
      className={`group relative bg-[#18181b] rounded-3xl overflow-hidden border border-white/5 hover:border-vfm-lime/50 shadow-xl transition-all duration-500 ease-out flex flex-col hover:-translate-y-2 animate-slide-up ${!isLocked ? 'cursor-pointer focus:outline-none focus:ring-2 focus:ring-vfm-lime' : 'focus:outline-none'}`} 
      style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }} // Cap delay for large lists
    >
      {discount && !isLocked && (<div className="absolute top-0 left-0 z-30 bg-vfm-lime text-black px-4 py-2 rounded-br-2xl shadow-xl border-b-2 border-r-2 border-white/20"><span className="text-xl font-display font-black tracking-tighter">{discount}</span></div>)}
      
      {/* VFM Score Indicator */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className="relative w-14 h-14 group/score hover:scale-110 transition-transform">
             <div className="absolute inset-0 bg-black/80 backdrop-blur-md rounded-full shadow-2xl"></div>
             <svg className="relative w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                 <circle cx="28" cy="28" r={radius} stroke="#333" strokeWidth="4" fill="transparent" />
                 <circle cx="28" cy="28" r={radius} stroke={scoreColor} strokeWidth="4" fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" style={{ filter: `drop-shadow(0 0 4px ${scoreColor})` }} />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-sm font-black leading-none ${score >= 8 ? 'text-vfm-lime' : score >= 6 ? 'text-yellow-400' : 'text-red-500'}`}>{score}</span>
                 <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">VFM</span>
             </div>
        </div>
        
        {hotel.squadFriendly && (<div className="bg-vfm-purple text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/10"><Users className="w-3 h-3" /> Squad Pick</div>)}
      </div>

      <div className="relative h-64 overflow-hidden bg-zinc-900">
        <img src={imgSrc} alt={hotel.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={handleError} loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 text-white text-xs font-medium border border-white/10"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /><span>{hotel.rating}</span></div>
        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
            <button aria-label="Share this hotel" onClick={(e) => { e.stopPropagation(); onInteract('share'); }} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><Share2 className="w-5 h-5 text-white" /></button>
            <button aria-label="Save this hotel" onClick={(e) => { e.stopPropagation(); onInteract('save'); }} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><Heart className={`w-5 h-5 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} /></button>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col relative z-10">
        {isLocked && (<div className="absolute inset-0 backdrop-blur-[4px] z-10 bg-[#18181b]/60 flex items-center justify-center pointer-events-none"></div>)}
        <div className={`mb-4 transition-all duration-300 ${isLocked ? 'blur-[3px]' : ''}`}>
            <h3 className="text-xl font-display font-bold text-white leading-tight group-hover:text-vfm-lime transition-colors line-clamp-2 h-14">{hotel.name}</h3>
            <div className="flex items-center text-zinc-400 text-xs font-medium mt-1"><MapPin className="w-3 h-3 mr-1 text-vfm-orange shrink-0" /><span className="truncate max-w-[250px]">{hotel.location}</span></div>
        </div>
        
        {/* Value Showcase - Savings Calculation */}
        {savingsAmount > 0 && (
            <div className="mb-4 bg-zinc-900/80 rounded-lg p-2 flex items-center gap-3 border border-dashed border-vfm-lime/30">
                <div className="w-8 h-8 rounded-full bg-vfm-lime/10 flex items-center justify-center shrink-0"><ArrowUpRight className="w-5 h-5 text-vfm-lime" /></div>
                <div className="min-w-0">
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest truncate">Value Showcase</div>
                    <div className="text-xs text-white truncate">Save <span className="font-bold text-vfm-lime">₹{savingsAmount.toLocaleString()}</span> vs Market Avg</div>
                </div>
            </div>
        )}
        
        {/* Smart Hack Section */}
        <div className={`mb-5 group/hack relative rounded-xl border border-dashed border-vfm-lime/30 bg-vfm-lime/5 p-3 transition-colors hover:bg-vfm-lime/10 ${isLocked ? 'blur-[3px]' : ''}`}>
             <div className="flex items-start gap-2">
                 <div className="p-1.5 bg-vfm-lime/10 rounded-lg shrink-0 border border-vfm-lime/20"><Zap className="w-3.5 h-3.5 text-vfm-lime" /></div>
                 <div>
                     <div className="text-[10px] font-bold text-vfm-lime uppercase tracking-widest mb-0.5">VFM Smart Hack</div>
                     <p className="text-xs text-zinc-300 leading-snug line-clamp-2">"{hotel.smartHack}"</p>
                 </div>
             </div>
        </div>
        
        <div className="mt-auto pt-4 border-t border-white/5 relative z-20">
            {isLocked ? (
                <div className="flex flex-col items-center justify-center py-2 text-center relative z-50">
                    <div className="text-vfm-lime font-bold text-lg mb-1 flex items-center gap-2"><Lock className="w-5 h-5" /> Secret Member Deal</div>
                    <p className="text-xs text-zinc-400 mb-3">Unlock hidden pricing & hack</p>
                    <button onClick={(e) => { e.stopPropagation(); onInteract('unlock'); }} className="w-full bg-vfm-lime text-black hover:bg-white transition-colors py-3 rounded-xl font-bold uppercase tracking-wide shadow-lg animate-pulse">Unlock Now</button>
                </div>
            ) : (
                <>
                    <div className="flex items-end justify-between mb-3">
                        <div>
                            <div className="text-[10px] text-zinc-400 font-bold uppercase mb-0.5">Best Deal via {provider}</div>
                            <div className="flex items-baseline gap-2"><span className="text-2xl font-display font-bold text-white">{priceDisplay}</span>{marketPrice && (<span className="text-sm text-zinc-500 line-through decoration-red-500/50">{marketPrice}</span>)}</div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={(e) => { e.stopPropagation(); setIsTracking(!isTracking); if(!isTracking) onInteract('unlock'); }} className={`border transition-all py-3 rounded-xl font-bold text-xs uppercase tracking-wide flex items-center justify-center gap-1 ${isTracking ? 'bg-vfm-lime/10 border-vfm-lime text-vfm-lime' : 'bg-white/5 border-white/10 text-white hover:bg-white/10'}`}>
                            {isTracking ? <Activity className="w-3 h-3" /> : <Bell className="w-3 h-3" />} {isTracking ? 'Tracking' : 'Track Price'}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); onInteract('book'); }} className="group/book bg-white text-black hover:bg-vfm-lime transition-all py-3 rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg flex items-center justify-center gap-1 overflow-hidden relative">
                            <span className="relative z-10 flex items-center gap-1">Check Availability <ExternalLink className="w-3 h-3 group-hover/book:translate-x-1 transition-transform" /></span>
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/book:translate-y-0 transition-transform duration-300"></div>
                        </button>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};