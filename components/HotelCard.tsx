import React, { useState } from 'react';
import { Hotel } from '../types';
import { Star, MapPin, Wifi, Users, Zap, TrendingUp, Heart, Share2, Info, Lock } from 'lucide-react';

interface HotelCardProps {
  hotel: Hotel;
  index: number;
  onInteract: (type: 'view' | 'book' | 'save' | 'unlock') => void;
}

export const HotelCard: React.FC<HotelCardProps> = ({ hotel, index, onInteract }) => {
  const [isSaved, setIsSaved] = useState(false);
  
  const priceDisplay = hotel.bookingOptions?.[0]?.price || "Check Price";
  const originalPrice = hotel.bookingOptions?.[0]?.originalPrice;
  const discount = hotel.bookingOptions?.[0]?.discount;

  const handleBookClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteract('book');
  };

  const handleUnlockClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInteract('unlock');
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
    if (!isSaved) onInteract('save');
  };

  // Determine if this deal is locked
  const isLocked = hotel.isSecretDeal;

  return (
    <div 
      onClick={() => !isLocked && onInteract('view')}
      className={`group relative bg-[#18181b] rounded-3xl overflow-hidden border border-white/5 hover:border-vfm-lime/50 shadow-xl transition-all duration-500 ease-out flex flex-col hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(204,255,0,0.1)] animate-slide-up ${!isLocked ? 'cursor-pointer' : ''}`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer z-0 pointer-events-none" />

      {/* VFM Score Badge - Top Right */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className="bg-vfm-lime text-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 font-display font-bold text-sm transform transition-transform group-hover:scale-110">
            <TrendingUp className="w-4 h-4" />
            <span>{hotel.vfmScore || 8.5}/10 VFM</span>
        </div>
        {hotel.squadFriendly && (
             <div className="bg-vfm-purple text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg flex items-center gap-1 border border-white/10">
                <Users className="w-3 h-3" /> Squad Pick
            </div>
        )}
      </div>

      {/* Image Area */}
      <div className="relative h-64 overflow-hidden bg-zinc-900">
        <img 
          src={hotel.imageUrl} 
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
             (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${hotel.name.replace(/[^a-zA-Z0-9]/g, '')}/800/600`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-90" />
        
        {/* Rating Bubble */}
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 text-white text-xs font-medium border border-white/10 shadow-lg">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span>{hotel.rating}</span>
          <span className="text-zinc-400">({hotel.reviewsSummary?.split(' ').slice(0, 3).join(' ')}...)</span>
        </div>

        {/* Action Buttons */}
        <button 
            onClick={handleSave}
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all active:scale-90 border border-white/10"
        >
            <Heart className={`w-5 h-5 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col relative z-10">
        {/* Secret Deal Overlay for Body */}
        {isLocked && (
            <div className="absolute inset-0 backdrop-blur-[4px] z-10 bg-[#18181b]/60 flex items-center justify-center pointer-events-none">
                {/* Visual cue handled by the button below */}
            </div>
        )}

        {/* Header */}
        <div className={`mb-4 transition-all duration-300 ${isLocked ? 'blur-[3px]' : ''}`}>
            <div className="flex justify-between items-start mb-1">
                 <h3 className="text-xl font-display font-bold text-white leading-tight group-hover:text-vfm-lime transition-colors line-clamp-2">{hotel.name}</h3>
            </div>
            <div className="flex items-center text-zinc-400 text-xs font-medium">
                <MapPin className="w-3 h-3 mr-1 text-vfm-orange" />
                <span className="truncate max-w-[250px]">{hotel.location}</span>
            </div>
        </div>

        {/* Tags */}
        <div className={`flex flex-wrap gap-2 mb-4 ${isLocked ? 'blur-[3px]' : ''}`}>
            {hotel.vibeMatch && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/5 rounded border border-white/10 text-vfm-purple">
                    {hotel.vibeMatch}
                </span>
            )}
            {hotel.workationReady && (
                 <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 bg-white/5 rounded border border-white/10 text-cyan-400 flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> Work Ready
                </span>
            )}
        </div>

        {/* Smart Hack (The Strategy) */}
        <div className={`mb-5 bg-vfm-lime/5 border-l-2 border-vfm-lime pl-3 py-2 rounded-r-lg ${isLocked ? 'blur-[3px]' : ''}`}>
            <div className="flex items-center gap-1.5 mb-1 text-vfm-lime text-[10px] font-bold uppercase tracking-widest">
                <Zap className="w-3 h-3" /> Smart Hack
            </div>
            <p className="text-xs text-zinc-300 italic">"{hotel.smartHack || 'Book mid-week for the best rates.'}"</p>
        </div>

        {/* Price & Booking */}
        <div className="mt-auto pt-4 border-t border-white/5 relative z-20">
            {isLocked ? (
                // Locked State
                <div className="flex flex-col items-center justify-center py-2 text-center relative z-50">
                    <div className="text-vfm-lime font-bold text-lg mb-1 flex items-center gap-2">
                        <Lock className="w-5 h-5" /> Secret Member Deal
                    </div>
                    <p className="text-xs text-zinc-400 mb-3">Unlock hidden pricing & hack</p>
                    <button 
                        onClick={handleUnlockClick}
                        className="w-full bg-vfm-lime text-black hover:bg-white transition-colors py-3 rounded-xl font-bold uppercase tracking-wide shadow-lg animate-pulse"
                    >
                        Unlock Now
                    </button>
                </div>
            ) : (
                // Unlocked State
                <>
                    <div className="flex items-end justify-between mb-3">
                        <div>
                            <div className="text-xs text-zinc-500 font-medium uppercase mb-0.5">Total VFM Deal</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-display font-bold text-white">{priceDisplay}</span>
                                {originalPrice && (
                                    <span className="text-sm text-zinc-500 line-through decoration-red-500/50">{originalPrice}</span>
                                )}
                            </div>
                        </div>
                        {discount && (
                            <div className="bg-red-500/10 text-red-400 text-xs font-bold px-2 py-1 rounded">
                                {discount}
                            </div>
                        )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => onInteract('view')}
                            className="bg-white/5 hover:bg-white/10 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wide border border-white/10"
                        >
                            View Details
                        </button>
                        <button
                          onClick={handleBookClick}
                          className="bg-white text-black hover:bg-vfm-lime transition-all py-3 rounded-xl font-bold text-xs uppercase tracking-wide shadow-lg"
                        >
                          Book Now
                        </button>
                    </div>

                    
                    {hotel.squadFriendly && (
                        <div className="mt-2 text-center">
                            <span className="text-[10px] text-zinc-500 font-mono">
                                ≈ ₹{Math.round((hotel.bestPrice || 4000) / 4)}/person (Squad of 4)
                            </span>
                        </div>
                    )}
                </>
            )}
        </div>
      </div>
    </div>
  );
};