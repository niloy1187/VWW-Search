
import React from 'react';
import { Hotel, Activity, TravelPackage, Rental, Flight, SearchResult } from '../types';
import { X, MapPin, Star, Wifi, Users, TrendingUp, Zap, ArrowRight, Share2, Heart, CheckCircle2, Clock, Calendar, ShieldCheck, Car, Fuel, Settings, Info, Plane, Luggage, AlertCircle } from 'lucide-react';

interface HotelDetailsModalProps {
  hotel: SearchResult; // Can be any type now
  onClose: () => void;
  onBook: () => void;
}

export const HotelDetailsModal: React.FC<HotelDetailsModalProps> = ({ hotel: item, onClose, onBook }) => {
  if (!item) return null;

  const priceDisplay = item.bookingOptions?.[0]?.price || "Check Price";
  const originalPrice = item.bookingOptions?.[0]?.originalPrice;

  // Type Guards
  const isStay = item.type === 'stay';
  const isActivity = item.type === 'activity';
  const isPackage = item.type === 'package';
  const isRental = item.type === 'rental';
  const isFlight = item.type === 'flight';

  const stay = item as Hotel;
  const activity = item as Activity;
  const pkg = item as TravelPackage;
  const rental = item as Rental;
  const flight = item as Flight;
  
  const images = (item as any).images || [item.imageUrl];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-xl animate-fade-in" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-5xl h-[90vh] bg-[#121212] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 animate-pop">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-md transition-all"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Left: Visuals */}
        <div className="w-full md:w-1/2 h-64 md:h-full relative bg-zinc-900 flex flex-col">
            <div className="h-2/3 relative overflow-hidden group">
                <img 
                    src={item.imageUrl} 
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${item.name.replace(/\s/g, '')}/800/600`;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] to-transparent opacity-50" />
                
                <div className="absolute bottom-6 left-6">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-vfm-lime text-black font-display font-bold px-3 py-1 rounded-lg text-lg shadow-lg">
                            {item.vfmScore}/10
                        </div>
                        <div className="text-white font-bold text-shadow">VFM Score</div>
                    </div>
                    <div className="text-zinc-300 text-sm max-w-xs leading-relaxed drop-shadow-md">
                        {item.vfmReason}
                    </div>
                </div>
            </div>
            
            {/* Mini Gallery */}
            <div className="h-1/3 grid grid-cols-2">
                {images.length > 1 ? (
                    images.slice(1, 3).map((img, i) => (
                        <div key={i} className="relative overflow-hidden border-t border-r border-black/20">
                            <img src={img} className="w-full h-full object-cover hover:opacity-80 transition-opacity" alt="Gallery" />
                        </div>
                    ))
                ) : (
                    <>
                        <div className="bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">Map View</div>
                        <div className="bg-zinc-800 flex items-center justify-center text-zinc-600 text-xs">Street View</div>
                    </>
                )}
            </div>
        </div>

        {/* Right: Content */}
        <div className="w-full md:w-1/2 flex flex-col h-full bg-[#121212]">
            <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 text-vfm-orange text-xs font-bold uppercase tracking-wider mb-2">
                        <TrendingUp className="w-4 h-4" /> Trending Now
                    </div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-2 leading-tight">
                        {item.name}
                    </h2>
                    <div className="flex items-center gap-2 text-zinc-400 text-sm">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {isFlight 
                            ? `${flight.origin} ➔ ${flight.destination}` 
                            : (item as any).location || (item as any).destination}
                        </span>
                    </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-3 mb-8">
                    <div className="px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center gap-1.5 text-sm font-medium text-white">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        {item.rating} Rating
                    </div>
                    {isFlight && (
                        <div className="px-3 py-1.5 rounded-lg bg-vfm-lime/10 border border-vfm-lime/20 text-vfm-lime text-sm font-bold">
                             {flight.tripType === 'oneway' ? 'One Way' : 'Round Trip'}
                        </div>
                    )}
                    {isRental && (
                         <div className="px-3 py-1.5 rounded-lg bg-vfm-orange/20 border border-vfm-orange/30 text-vfm-orange text-sm font-bold flex items-center gap-1.5">
                            <Car className="w-4 h-4" /> {rental.vehicleType}
                        </div>
                    )}
                </div>

                {/* Smart Hack */}
                <div className="mb-8 bg-vfm-lime/5 rounded-xl p-5 border border-vfm-lime/10">
                    <div className="flex items-center gap-2 text-vfm-lime font-bold uppercase tracking-widest text-xs mb-2">
                        <Zap className="w-4 h-4" /> Smart Hack
                    </div>
                    <p className="text-white text-sm font-medium italic">
                        "{item.smartHack || 'Book via mobile app for extra 5% off.'}"
                    </p>
                </div>

                {/* Dynamic Content */}
                
                {/* FLIGHTS */}
                {isFlight && (
                    <div className="mb-8">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Flight Details</h3>
                        <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{flight.departureTime}</div>
                                    <div className="text-xs text-zinc-500 font-mono">{flight.origin}</div>
                                </div>
                                <div className="flex-1 px-4 flex flex-col items-center">
                                    <div className="text-[10px] text-zinc-500 mb-1">{flight.duration}</div>
                                    <div className="w-full h-px bg-zinc-700 relative">
                                        <Plane className="w-3 h-3 text-vfm-lime absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform rotate-90" />
                                    </div>
                                    <div className="text-[10px] text-vfm-lime mt-1">{flight.stops === 0 ? 'Direct' : `${flight.stops} Stops`}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-white">{flight.arrivalTime}</div>
                                    <div className="text-xs text-zinc-500 font-mono">{flight.destination}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <Luggage className="w-4 h-4" /> {flight.baggageAllowance || '15kg Check-in'}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <Info className="w-4 h-4" /> {flight.layoverDetails || 'No details'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* RENTALS */}
                {isRental && (
                     <div className="mb-8">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Vehicle Specs</h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase">Year</span>
                                <span className="text-white font-bold">{rental.modelYear || '2022+'}</span>
                            </div>
                            <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase">Transmission</span>
                                <span className="text-white font-bold">{rental.transmission}</span>
                            </div>
                            <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase">Fuel Policy</span>
                                <span className="text-white font-bold">{rental.fuelPolicy || 'Full to Full'}</span>
                            </div>
                            <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5 flex flex-col">
                                <span className="text-[10px] text-zinc-500 uppercase">Deposit</span>
                                <span className="text-white font-bold">{rental.deposit || '₹0'}</span>
                            </div>
                        </div>
                        {rental.features && (
                            <div className="flex flex-wrap gap-2">
                                {rental.features.map((f, i) => (
                                    <span key={i} className="px-2 py-1 bg-white/5 rounded border border-white/10 text-[10px] text-zinc-300">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        )}
                     </div>
                )}

                {/* ACTIVITIES */}
                {isActivity && activity.itinerary && (
                     <div className="mb-8">
                        <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Timeline</h3>
                        <div className="relative pl-4 border-l border-zinc-800 space-y-6">
                            {activity.itinerary.map((step, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-vfm-purple box-content border-4 border-[#121212]"></div>
                                    <p className="text-sm text-zinc-300 leading-relaxed">{step}</p>
                                </div>
                            ))}
                        </div>
                     </div>
                )}

                {/* PACKAGES */}
                {isPackage && (
                    <>
                         <div className="mb-8 grid grid-cols-2 gap-4">
                             <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                 <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Inclusions</h3>
                                 <ul className="space-y-1">
                                     {pkg.inclusions.map((inc, i) => (
                                         <li key={i} className="flex items-center gap-2 text-xs text-zinc-300">
                                             <CheckCircle2 className="w-3 h-3 text-green-500" /> {inc}
                                         </li>
                                     ))}
                                 </ul>
                             </div>
                             {pkg.exclusions && (
                                 <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                     <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Exclusions</h3>
                                     <ul className="space-y-1">
                                         {pkg.exclusions.map((exc, i) => (
                                             <li key={i} className="flex items-center gap-2 text-xs text-zinc-400">
                                                 <AlertCircle className="w-3 h-3 text-red-500" /> {exc}
                                             </li>
                                         ))}
                                     </ul>
                                 </div>
                             )}
                         </div>
                         
                         {pkg.dayWiseItinerary && (
                            <div className="mb-8">
                                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Day-by-Day</h3>
                                <div className="space-y-4">
                                    {pkg.dayWiseItinerary.map((day, i) => (
                                        <div key={i} className="bg-white/5 p-4 rounded-xl border border-white/5">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="px-2 py-0.5 bg-vfm-lime text-black text-[10px] font-bold rounded uppercase">Day {day.day}</span>
                                                <h4 className="text-white font-bold text-sm">{day.title}</h4>
                                            </div>
                                            <p className="text-xs text-zinc-400 leading-relaxed">{day.description}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Sticky Footer */}
            <div className="p-6 md:p-8 border-t border-white/10 bg-[#121212] relative z-20">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-xs text-zinc-500 font-bold uppercase">Total Price</div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-display font-bold text-white">{priceDisplay}</span>
                            {originalPrice && (
                                <span className="text-lg text-zinc-500 line-through decoration-red-500/50">{originalPrice}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button className="p-3 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white transition-colors">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <button 
                    onClick={onBook}
                    className="w-full py-4 bg-white hover:bg-vfm-lime text-black font-display font-bold text-lg uppercase tracking-wider rounded-xl transition-all hover:scale-[1.02] shadow-xl flex items-center justify-center gap-2"
                >
                    Request Booking <ArrowRight className="w-5 h-5" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};
