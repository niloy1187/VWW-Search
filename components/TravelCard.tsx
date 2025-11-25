
import React, { useState } from 'react';
import { SearchResult, Flight, Rental, Activity, TravelPackage } from '../types';
import { Plane, Car, Calendar, MapPin, Zap, TrendingUp, Lock, ArrowRight, Heart, Clock, Luggage, User, ArrowRightLeft, ShieldCheck, Gauge, Fuel } from 'lucide-react';

interface TravelCardProps {
  item: SearchResult;
  index: number;
  onInteract: (type: 'view' | 'book' | 'save' | 'unlock') => void;
}

export const TravelCard: React.FC<TravelCardProps> = ({ item, index, onInteract }) => {
  const [isSaved, setIsSaved] = useState(false);
  const isLocked = item.isSecretDeal;
  
  const priceDisplay = item.bookingOptions?.[0]?.price || "Check Price";
  
  const handleBookClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onInteract('book');
  };

  const handleSave = (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsSaved(!isSaved);
      if(!isSaved) onInteract('save');
  }

  // Render content based on type
  const renderContent = () => {
    switch (item.type) {
      case 'flight':
        const flight = item as Flight;
        return (
          <div className="flex flex-col gap-4">
             <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center font-bold text-zinc-400 border border-white/5">
                         {flight.airlineCode}
                     </div>
                     <div>
                         <div className="text-white font-bold text-lg leading-none mb-1">{flight.departureTime} <span className="text-zinc-600 mx-1">—</span> {flight.arrivalTime}</div>
                         <div className="text-xs text-zinc-500 font-medium">{flight.duration} • {flight.stops === 0 ? 'Non-stop' : `${flight.stops} Stop(s)`}</div>
                     </div>
                 </div>
             </div>
             <div className="flex items-center justify-between text-xs text-zinc-400 bg-zinc-900/50 p-3 rounded-lg border border-white/5 relative overflow-hidden">
                 <div className={`absolute top-0 right-0 px-2 py-0.5 text-[9px] uppercase font-bold text-white rounded-bl ${flight.tripType === 'roundtrip' ? 'bg-vfm-lime text-black' : 'bg-zinc-700'}`}>
                    {flight.tripType === 'oneway' ? 'One Way' : 'Round Trip'}
                 </div>

                 <div className="flex flex-col">
                     <span className="uppercase text-[10px] font-bold text-zinc-600">Origin</span>
                     <span className="text-white font-mono text-sm">{flight.origin}</span>
                 </div>
                 <div className="flex items-center gap-2 px-4">
                    <div className="h-[1px] w-8 bg-zinc-700"></div>
                    {flight.tripType === 'oneway' ? <ArrowRight className="w-3 h-3 text-vfm-lime" /> : <ArrowRightLeft className="w-3 h-3 text-vfm-lime" />}
                    <div className="h-[1px] w-8 bg-zinc-700"></div>
                 </div>
                 <div className="flex flex-col text-right">
                     <span className="uppercase text-[10px] font-bold text-zinc-600">Dest</span>
                     <span className="text-white font-mono text-sm">{flight.destination}</span>
                 </div>
             </div>
          </div>
        );
      
      case 'rental':
        const rental = item as Rental;
        return (
          <div className="flex flex-col gap-3">
             <div className="flex items-center gap-2 mb-2 flex-wrap">
                 <div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-zinc-300 uppercase font-bold">
                     {rental.transmission}
                 </div>
                 <div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-zinc-300 uppercase font-bold">
                     {rental.seats} Seats
                 </div>
                 {rental.modelYear && (
                     <div className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-zinc-300 uppercase font-bold">
                        {rental.modelYear}
                     </div>
                 )}
             </div>
             
             <div className="grid grid-cols-2 gap-2">
                 <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded border border-white/5">
                    <Gauge className="w-3 h-3 text-vfm-orange" />
                    <span className="truncate">{rental.mileageLimit || 'Unlimited Km'}</span>
                 </div>
                 <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/50 p-2 rounded border border-white/5">
                    <Fuel className="w-3 h-3 text-vfm-purple" />
                    <span className="truncate">{rental.fuelPolicy || 'Full-Full'}</span>
                 </div>
             </div>

             <div className="text-sm text-zinc-400 mt-1 flex justify-between items-center">
                 <span>Vendor: <span className="text-white font-medium">{rental.vendor}</span></span>
             </div>
          </div>
        );

      case 'activity':
          const activity = item as Activity;
          return (
             <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2 text-xs text-zinc-400 mb-2">
                     <Clock className="w-3 h-3" /> {activity.duration}
                     <span className="text-zinc-600">•</span>
                     <MapPin className="w-3 h-3" /> {activity.location}
                 </div>
                 <div className="inline-block self-start px-2 py-1 bg-vfm-purple/20 text-vfm-purple text-[10px] font-bold uppercase rounded border border-vfm-purple/30">
                     {activity.category}
                 </div>
                 {activity.highlights && (
                     <div className="mt-2 text-xs text-zinc-500 line-clamp-2">
                         <span className="text-zinc-400 font-bold">Highlights:</span> {activity.highlights.slice(0,2).join(', ')}
                     </div>
                 )}
             </div>
          );

      case 'package':
          const pkg = item as TravelPackage;
          return (
             <div className="flex flex-col gap-3">
                 <div className="text-xs text-white font-bold bg-zinc-800 px-3 py-2 rounded-lg flex items-center gap-2 w-fit border border-white/10">
                     <Calendar className="w-3 h-3 text-vfm-lime" /> {pkg.duration}
                 </div>
                 <div className="flex flex-wrap gap-1">
                     {pkg.inclusions.map((inc, i) => (
                         <span key={i} className="text-[10px] bg-white/5 text-zinc-400 px-2 py-1 rounded border border-white/5">
                             {inc}
                         </span>
                     ))}
                 </div>
             </div>
          );
      
      default: return null;
    }
  };

  const getIcon = () => {
      switch(item.type) {
          case 'flight': return <Plane className="w-4 h-4 text-vfm-lime" />;
          case 'rental': return <Car className="w-4 h-4 text-vfm-orange" />;
          case 'activity': return <User className="w-4 h-4 text-vfm-purple" />;
          case 'package': return <Luggage className="w-4 h-4 text-cyan-400" />;
          default: return <Zap className="w-4 h-4" />;
      }
  };

  return (
    <div 
      onClick={() => onInteract('view')}
      className={`group relative bg-[#18181b] rounded-3xl overflow-hidden border border-white/5 hover:border-vfm-lime/50 shadow-xl transition-all duration-500 flex flex-col hover:-translate-y-2 animate-slide-up cursor-pointer`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* VFM Score */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-vfm-lime text-black px-2 py-1 rounded-lg shadow-lg flex items-center gap-1 font-display font-bold text-xs transform transition-transform group-hover:scale-110">
            <TrendingUp className="w-3 h-3" />
            <span>{item.vfmScore}/10</span>
        </div>
      </div>

      {/* Header Image */}
      <div className="relative h-40 overflow-hidden bg-zinc-900">
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
             (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.name.replace(/[^a-zA-Z0-9]/g, '')}/800/600`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#18181b] via-transparent to-transparent opacity-90" />
        
        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1 text-white text-xs font-medium border border-white/10">
            {getIcon()}
            <span className="uppercase font-bold tracking-wider text-[10px]">{item.type}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col relative z-10">
        <div className="mb-4">
            <h3 className="text-lg font-display font-bold text-white leading-tight group-hover:text-vfm-lime transition-colors mb-1 truncate">{item.name}</h3>
            <p className="text-xs text-zinc-500 line-clamp-1">{item.description}</p>
        </div>

        {renderContent()}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
             <div>
                 <div className="text-[10px] text-zinc-500 uppercase font-bold">Deal Price</div>
                 <div className="text-xl font-display font-bold text-white">{priceDisplay}</div>
             </div>
             <button 
                onClick={handleBookClick}
                className="bg-white hover:bg-vfm-lime hover:text-black text-black font-bold py-2 px-4 rounded-xl text-xs uppercase tracking-wide transition-all"
             >
                 Book Now
             </button>
        </div>
      </div>
    </div>
  );
};
