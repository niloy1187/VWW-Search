import React, { useState, useEffect } from 'react';
import { SearchResult, Flight, Rental, Activity, TravelPackage } from '../types';
import { Plane, Car, User, Luggage, Zap, ArrowUpRight, ArrowRight, ArrowRightLeft, Gauge, Fuel, Clock, MapPin, Calendar, Share2, Heart } from 'lucide-react';
import { getSmartFallbackImage } from '../services/geminiService';

interface TravelCardProps {
  item: SearchResult;
  index: number;
  isSaved?: boolean;
  onInteract: (type: 'view' | 'book' | 'save' | 'unlock' | 'share') => void;
}

export const TravelCard: React.FC<TravelCardProps> = ({ item, index, isSaved = false, onInteract }) => {
  const [imgSrc, setImgSrc] = useState(item.imageUrl);
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    setImgSrc(item.imageUrl);
    setHasError(false);
  }, [item]);

  const priceDisplay = item.bookingOptions?.[0]?.price;
  const marketPrice = item.marketPrice || item.bookingOptions?.[0]?.originalPrice;
  const discount = item.bookingOptions?.[0]?.discount;
  const score = item.vfmScore || 0;
  
  const handleError = () => { 
      if (!hasError) { 
          setHasError(true); 
          const loc = (item as any).location || (item as any).destination || ''; 
          setImgSrc(getSmartFallbackImage(item.type, item.name, loc)); 
      } 
  };
  
  const cleanPrice = parseInt(String(priceDisplay || '0').replace(/[^0-9]/g, '') || '0');
  const cleanMarket = parseInt(String(marketPrice || '0').replace(/[^0-9]/g, '') || '0');
  const savingsPercent = cleanMarket > cleanPrice ? Math.round(((cleanMarket - cleanPrice) / cleanMarket) * 100) : 0;
  
  let scoreColor = score >= 8 ? 'text-vfm-lime border-vfm-lime/30' : score >= 6 ? 'text-yellow-400 border-yellow-400/30' : 'text-red-500 border-red-500/30';

  const getIcon = () => {
      switch(item.type) {
          case 'flight': return <Plane className="w-4 h-4 text-vfm-lime" />;
          case 'rental': return <Car className="w-4 h-4 text-vfm-orange" />;
          case 'activity': return <User className="w-4 h-4 text-vfm-purple" />;
          case 'package': return <Luggage className="w-4 h-4 text-cyan-400" />;
          default: return <Zap className="w-4 h-4" />;
      }
  };

  const renderContent = () => {
    switch (item.type) {
      case 'flight':
        const flight = item as Flight;
        return (
          <div className="flex flex-col gap-4">
             <div className="flex items-center gap-3"><div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-400 border border-white/5">{flight.airlineCode}</div><div><div className="text-white font-bold text-lg leading-none mb-1">{flight.departureTime} <span className="text-zinc-600 mx-1">—</span> {flight.arrivalTime}</div><div className="text-xs text-zinc-500 font-medium">{flight.duration} • {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop(s)`}</div></div></div>
             <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-white/5 relative overflow-hidden">
                 <div className={`absolute top-0 right-0 px-2 py-0.5 text-[9px] uppercase font-bold text-white rounded-bl ${flight.tripType === 'roundtrip' ? 'bg-vfm-lime text-black' : 'bg-zinc-700'}`}>{flight.tripType === 'oneway' ? 'One Way' : 'Round Trip'}</div>
                 <div className="flex flex-col"><span className="uppercase text-[10px] font-bold text-zinc-600">Origin</span><span className="text-white font-mono text-sm">{flight.origin}</span></div>
                 <div className="flex items-center gap-2 px-4"><div className="h-[1px] w-8 bg-zinc-700"></div>{flight.tripType === 'oneway' ? <ArrowRight className="w-3 h-3 text-vfm-lime" /> : <ArrowRightLeft className="w-3 h-3 text-vfm-lime" />}<div className="h-[1px] w-8 bg-zinc-700"></div></div>
                 <div className="flex flex-col text-right"><span className="uppercase text-[10px] font-bold text-zinc-600">Dest</span><span className="text-white font-mono text-sm">{flight.destination}</span></div>
             </div>
          </div>
        );
      case 'rental':
        const rental = item as Rental;
        return (
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 mb-2 flex-wrap"><div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-zinc-300 uppercase font-bold">{rental.transmission}</div><div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-zinc-300 uppercase font-bold">{rental.seats} Seats</div></div>
             <div className="grid grid-cols-2 gap-2"><div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded border border-white/5"><Gauge className="w-3 h-3 text-vfm-orange" /><span className="truncate">{rental.mileageLimit || 'Unlimited Km'}</span></div><div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded border border-white/5"><Fuel className="w-3 h-3 text-vfm-purple" /><span className="truncate">{rental.fuelPolicy || 'Full-Full'}</span></div></div>
          </div>
        );
      case 'activity':
          const activity = item as Activity;
          return (<div className="flex flex-col gap-2"><div className="flex items-center gap-2 text-xs text-zinc-400 mb-2"><Clock className="w-3 h-3" /> {activity.duration}<span className="text-zinc-600">•</span><MapPin className="w-3 h-3" /> {activity.location}</div><div className="inline-block self-start px-2 py-1 bg-vfm-purple/20 text-vfm-purple text-[10px] font-bold uppercase rounded border border-vfm-purple/30">{activity.category}</div></div>);
      case 'package':
          const pkg = item as TravelPackage;
          return (<div className="flex flex-col gap-3"><div className="text-xs text-white font-bold bg-zinc-800 px-3 py-2 rounded-lg flex items-center gap-2 w-fit border border-white/10"><Calendar className="w-3 h-3 text-vfm-lime" /> {pkg.duration}</div><div className="flex flex-wrap gap-1">{pkg.inclusions.map((inc, i) => (<span key={i} className="text-[10px] bg-white/5 text-zinc-400 px-2 py-1 rounded border border-white/5">{inc}</span>))}</div></div>);
      default: return null;
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onInteract('view');
    }
  };

  return (
    <div 
      onClick={() => onInteract('view')} 
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${item.name}`}
      className={`group relative bg-[#18181b] rounded-3xl overflow-hidden border border-white/5 hover:border-vfm-lime/50 shadow-xl transition-all duration-500 flex flex-col hover:-translate-y-2 animate-slide-up cursor-pointer focus:outline-none focus:ring-2 focus:ring-vfm-lime`} 
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {discount && (<div className="absolute top-0 left-0 z-30 bg-vfm-lime text-black px-4 py-2 rounded-br-2xl shadow-xl border-b-2 border-r-2 border-white/20"><span className="text-xl font-display font-black tracking-tighter">{discount}</span></div>)}
      <div className="absolute top-4 right-4 z-20">
        <div className={`bg-black/60 backdrop-blur px-2 py-1 rounded-lg shadow-lg flex items-center gap-2 font-display font-bold text-xs transform transition-transform group-hover:scale-110 border ${scoreColor}`}>
            <div className="relative w-6 h-6 flex items-center justify-center"><svg className="w-full h-full transform -rotate-90"><circle cx="12" cy="12" r={10} stroke="currentColor" strokeWidth="2.5" fill="transparent" className="text-white/10" /><circle cx="12" cy="12" r={10} stroke="currentColor" strokeWidth="2.5" fill="transparent" strokeDasharray={2 * Math.PI * 10} strokeDashoffset={(2 * Math.PI * 10) - (score / 10) * (2 * Math.PI * 10)} className={score >= 8 ? 'text-vfm-lime' : score >= 6 ? 'text-yellow-400' : 'text-red-500'} strokeLinecap="round" /></svg><div className={`absolute text-[8px] font-bold ${score >= 8 ? 'text-vfm-lime' : score >= 6 ? 'text-yellow-400' : 'text-red-500'}`}>{score}</div></div><span>VFM</span>
        </div>
      </div>
      <div className="relative h-40 overflow-hidden bg-zinc-900">
        <img src={imgSrc} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" onError={handleError} referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-90" />
        <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 text-white text-xs font-medium border border-white/10">{getIcon()}<span className="uppercase font-bold tracking-wider text-[10px]">{item.type}</span></div>
        <div className="absolute bottom-4 right-4 flex gap-2 translate-y-10 group-hover:translate-y-0 transition-transform duration-300">
            <button aria-label="Share" onClick={(e) => { e.stopPropagation(); onInteract('share'); }} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><Share2 className="w-4 h-4 text-white" /></button>
            <button aria-label="Save" onClick={(e) => { e.stopPropagation(); onInteract('save'); }} className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/10"><Heart className={`w-4 h-4 transition-colors ${isSaved ? 'text-red-500 fill-red-500' : 'text-white'}`} /></button>
        </div>
      </div>
      <div className="p-5 flex-1 flex flex-col relative z-10">
        <div className="mb-4"><h3 className="text-lg font-display font-bold text-white leading-tight group-hover:text-vfm-lime transition-colors mb-1 truncate">{item.name}</h3><p className="text-xs text-zinc-500 line-clamp-1">{item.description}</p></div>
        {renderContent()}
        <div className="mt-auto pt-4 border-t border-white/5 flex flex-col">
            {savingsPercent > 0 && (<div className="mb-3 w-full"><div className="flex justify-between items-end text-[10px] font-bold uppercase tracking-wider mb-1"><span className="text-zinc-500">Market Avg</span><span className="text-vfm-lime flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> {savingsPercent}% Saved</span></div><div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden flex"><div className="h-full bg-zinc-600" style={{ width: '40%' }}></div><div className="h-full bg-vfm-lime" style={{ width: '60%' }}></div></div></div>)}
             <div className="flex items-center justify-between"><div><div className="text-[10px] text-zinc-500 uppercase font-bold">Deal Price</div><div className="text-xl font-display font-bold text-white">{priceDisplay}</div></div><button onClick={(e) => { e.stopPropagation(); onInteract('book'); }} className="bg-white hover:bg-vfm-lime hover:text-black text-black font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wide transition-all">Book Now</button></div>
        </div>
      </div>
    </div>
  );
};