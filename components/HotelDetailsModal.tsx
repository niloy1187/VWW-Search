
import React, { useState, useEffect } from 'react';
import { SearchResult, Activity, TravelPackage, Rental, Flight, Hotel } from '../types';
import { X, MapPin, Star, TrendingUp, Zap, ArrowRight, Share2, Heart, CheckCircle2, Clock, Calendar, Car, Plane, Luggage, AlertCircle, Map as MapIcon, Image as ImageIcon, Info, Bell, Users, ArrowUpRight, Globe, Shield, Wifi, Coffee, Wind, Utensils, Monitor, Check, ChevronRight, ExternalLink, Ticket, CreditCard, ShieldCheck } from 'lucide-react';
import { getSmartFallbackImage } from '../services/geminiService';

interface HotelDetailsModalProps {
  hotel: SearchResult;
  onClose: () => void;
  onBook: () => void;
  onShare?: () => void;
}

export const HotelDetailsModal: React.FC<HotelDetailsModalProps> = ({ hotel: item, onClose, onBook, onShare }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'deals' | 'map'>('deals');
  const [alertSet, setAlertSet] = useState(false);
  const [imgSrc, setImgSrc] = useState(item.imageUrl);

  useEffect(() => {
    // Reset image on open
    setImgSrc(item.imageUrl);
  }, [item]);

  if (!item) return null;

  // Type Guards & Casting
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

  // Data Normalization
  const priceDisplay = String(item.bookingOptions?.[0]?.price || "Check Price");
  const discount = item.bookingOptions?.[0]?.discount;
  const mapQuery = encodeURIComponent((item as any).location || (item as any).destination || item.name);
  const mapUrl = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
  
  // Clean Price Logic
  const cleanPrice = parseInt(priceDisplay.replace(/[^0-9]/g, '') || '0');
  const marketPriceStr = item.marketPrice || item.bookingOptions?.[item.bookingOptions.length-1]?.price || '0';
  const cleanMarket = parseInt(String(marketPriceStr).replace(/[^0-9]/g, '') || '0');
  const savingsAmount = Math.max(0, cleanMarket - cleanPrice);
  const savingsPercent = cleanMarket > 0 ? Math.round((savingsAmount / cleanMarket) * 100) : 0;

  // Smart Hack Processing
  const rawHack = item.smartHack || 'Book via mobile for better rates';
  const isVerifiedHack = rawHack.toLowerCase().includes('guest verified') || rawHack.toLowerCase().includes('review');
  const displayHack = rawHack.replace(/Guest Verified:|Review Tip:/i, '').trim();

  // Comparison Logic - Ensure robust fallback and distinct provider styling
  const comparisonOptions = (item.bookingOptions || []).length > 0 
    ? item.bookingOptions 
    : [{ provider: 'Direct Deal', price: priceDisplay, originalPrice: null, discount: 'Best Price' }];

  const getProviderStyle = (name: string) => {
      const n = (name || "").toLowerCase();
      if (n.includes('agoda')) return { color: 'text-[#00aa6c]', bg: 'bg-[#00aa6c]/10', border: 'border-[#00aa6c]/20', label: 'Agoda' };
      if (n.includes('booking')) return { color: 'text-[#003580]', bg: 'bg-[#003580]/10', border: 'border-[#003580]/20', label: 'Booking.com' };
      if (n.includes('expedia')) return { color: 'text-[#FFD700]', bg: 'bg-[#FFD700]/10', border: 'border-[#FFD700]/20', label: 'Expedia' };
      if (n.includes('trip')) return { color: 'text-[#2e6be6]', bg: 'bg-[#2e6be6]/10', border: 'border-[#2e6be6]/20', label: 'Trip.com' };
      if (n.includes('indigo') || n.includes('6e')) return { color: 'text-[#0052cc]', bg: 'bg-[#0052cc]/10', border: 'border-[#0052cc]/20', label: 'IndiGo' };
      if (n.includes('direct')) return { color: 'text-vfm-lime', bg: 'bg-vfm-lime/10', border: 'border-vfm-lime/20', label: 'Direct' };
      return { color: 'text-zinc-300', bg: 'bg-zinc-800', border: 'border-zinc-700', label: name };
  };

  const getAmenityIcon = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('wifi')) return <Wifi className="w-3.5 h-3.5" />;
      if (n.includes('pool')) return <Wind className="w-3.5 h-3.5" />;
      if (n.includes('breakfast') || n.includes('food')) return <Utensils className="w-3.5 h-3.5" />;
      if (n.includes('coffee')) return <Coffee className="w-3.5 h-3.5" />;
      if (n.includes('tv') || n.includes('screen')) return <Monitor className="w-3.5 h-3.5" />;
      return <CheckCircle2 className="w-3.5 h-3.5" />;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-6 font-sans">
      <div className="absolute inset-0 bg-black/95 backdrop-blur-md animate-fade-in" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-7xl h-[100dvh] md:h-[90vh] bg-[#09090b] rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/10 animate-slide-up md:animate-pop">
        
        {/* Close Button Mobile */}
        <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-zinc-800 rounded-full text-white backdrop-blur-md transition-all border border-white/10 md:hidden"><X className="w-5 h-5" /></button>

        {/* LEFT COLUMN: Visuals */}
        <div className="w-full md:w-5/12 h-[35vh] md:h-full relative bg-zinc-900 flex flex-col shrink-0 border-r border-white/5 group">
            <img 
                src={imgSrc} 
                alt={item.name} 
                className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-105" 
                onError={(e) => { const loc = (item as any).location || (item as any).destination || ''; setImgSrc(getSmartFallbackImage(item.type, item.name, loc)); }} 
                referrerPolicy="no-referrer" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
            
            {/* Image Overlay Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
                    {discount && (<div className="bg-vfm-lime text-black px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide shadow-lg flex items-center gap-1"><Zap className="w-3 h-3 fill-black" /> {discount} OFF</div>)}
                    <div className="bg-black/60 backdrop-blur-md text-white border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1"><Star className="w-3 h-3 text-yellow-400 fill-yellow-400" /> {item.rating} Rating</div>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white leading-[1.1] mb-2 drop-shadow-2xl animate-slide-up" style={{ animationDelay: '200ms' }}>{item.name}</h2>
                <div className="flex items-center gap-2 text-zinc-300 text-sm font-medium animate-slide-up" style={{ animationDelay: '300ms' }}>
                    <MapPin className="w-4 h-4 text-vfm-lime" /> <span className="truncate max-w-xs">{isFlight ? `${flight.origin} ➔ ${flight.destination}` : (item as any).location || (item as any).destination}</span>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: Details & Comparison */}
        <div className="w-full md:w-7/12 flex flex-col h-full bg-[#09090b] relative">
            
            {/* Desktop Close */}
            <div className="hidden md:flex absolute top-6 right-6 z-20">
                <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-all border border-transparent hover:border-white/10"><X className="w-6 h-6" /></button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center border-b border-white/5 px-6 md:px-10 pt-4 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10">
                {[
                    { id: 'deals', label: 'Price Deals', icon: Ticket },
                    { id: 'overview', label: 'Details', icon: Info },
                    { id: 'map', label: 'Map View', icon: MapIcon },
                ].map((tab) => (
                    <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-4 py-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${activeTab === tab.id ? 'border-vfm-lime text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-vfm-lime' : ''}`} /> {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-900/20">
                <div className="p-6 md:p-10 pb-32 space-y-8">

                    {/* DEALS TAB (Default) */}
                    {activeTab === 'deals' && (
                        <div className="space-y-6 animate-fade-in">
                            
                            {/* VFM Intel Header */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="bg-[#121212] p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-vfm-lime/20 transition-all">
                                    <div className="flex items-center gap-2 text-zinc-500 font-bold text-[10px] uppercase tracking-widest mb-3"><TrendingUp className="w-3.5 h-3.5" /> Value Score</div>
                                    <div className="flex items-end gap-2 mb-2">
                                        <div className="text-4xl font-display font-bold text-white leading-none">{item.vfmScore}</div>
                                        <div className="text-sm text-zinc-600 font-sans font-medium mb-1">/ 10</div>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden mb-3">
                                        <div className="h-full bg-gradient-to-r from-vfm-lime to-green-500" style={{ width: `${(item.vfmScore || 0) * 10}%` }}></div>
                                    </div>
                                    <p className="text-xs text-zinc-400 font-medium">{item.vfmReason}</p>
                                </div>
                                
                                {/* Smart Hack Box with "Verified" Logic */}
                                <div className="bg-gradient-to-br from-vfm-lime/5 to-transparent p-5 rounded-2xl border border-vfm-lime/20 relative overflow-hidden">
                                     <div className="absolute -right-6 -top-6 text-vfm-lime/5 transform rotate-12"><Zap className="w-32 h-32" /></div>
                                     <div className="relative z-10 h-full flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center gap-2 text-vfm-lime font-bold text-[10px] uppercase tracking-widest mb-2"><Zap className="w-3.5 h-3.5" /> Smart Hack</div>
                                            <p className="text-sm font-bold text-white leading-snug">"{displayHack}"</p>
                                        </div>
                                        {isVerifiedHack && (
                                            <div className="mt-4 flex items-center gap-1.5 px-2 py-1 bg-green-500/10 rounded-lg w-fit border border-green-500/20">
                                                <ShieldCheck className="w-3 h-3 text-green-500" /> 
                                                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">Verified Guest Review</span>
                                            </div>
                                        )}
                                     </div>
                                </div>
                            </div>

                            {/* Comparison Table */}
                            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/5">
                                <div className="px-6 py-4 bg-zinc-900/50 border-b border-white/5 flex justify-between items-center">
                                    <h3 className="text-sm font-bold text-white flex items-center gap-2"><Globe className="w-4 h-4 text-zinc-500" /> Compare Rates</h3>
                                    {savingsAmount > 0 && (<div className="text-[10px] font-bold text-vfm-lime bg-vfm-lime/10 px-2 py-1 rounded border border-vfm-lime/20">Save {savingsPercent}%</div>)}
                                </div>
                                
                                <div className="divide-y divide-white/5">
                                    {comparisonOptions.map((opt, i) => {
                                        const isCheapest = i === 0;
                                        const style = getProviderStyle(opt.provider);
                                        const perks = i === 0 ? ["Free Cancel", "Instant"] : i === 1 ? ["Mobile Rate"] : ["Standard"];
                                        
                                        return (
                                            <div key={i} className={`grid grid-cols-12 gap-2 md:gap-4 px-4 md:px-6 py-4 items-center group transition-all hover:bg-white/[0.02] ${isCheapest ? 'bg-gradient-to-r from-vfm-lime/[0.03] to-transparent' : ''}`}>
                                                
                                                {/* Provider Info */}
                                                <div className="col-span-5 md:col-span-4 flex items-center gap-3">
                                                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center text-[10px] md:text-xs font-black border uppercase tracking-tighter ${style.color} ${style.bg} ${style.border}`}>
                                                        {style.label.substring(0, 2)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-xs md:text-sm font-bold ${isCheapest ? 'text-white' : 'text-zinc-400'}`}>{style.label}</span>
                                                        {isCheapest && <span className="text-[9px] text-vfm-lime font-bold uppercase tracking-wider md:hidden mt-0.5">Best Price</span>}
                                                    </div>
                                                </div>

                                                {/* Perks (Desktop) */}
                                                <div className="hidden md:flex col-span-4 justify-center gap-2 flex-wrap">
                                                    {perks.map((p, idx) => (
                                                        <span key={idx} className={`text-[10px] px-2 py-1 rounded bg-zinc-900 border font-medium whitespace-nowrap ${isCheapest ? 'text-zinc-300 border-white/10' : 'text-zinc-600 border-white/5'}`}>{p}</span>
                                                    ))}
                                                </div>

                                                {/* Price */}
                                                <div className="col-span-4 md:col-span-2 text-right flex flex-col items-end justify-center">
                                                    <div className={`text-base md:text-lg font-mono font-bold tracking-tight ${isCheapest ? 'text-vfm-lime' : 'text-zinc-300'}`}>{opt.price}</div>
                                                    {isCheapest && <span className="hidden md:block text-[9px] text-vfm-lime font-bold uppercase tracking-wider mt-0.5">Best Deal</span>}
                                                </div>

                                                {/* Action */}
                                                <div className="col-span-3 md:col-span-2 flex justify-end">
                                                    <button onClick={onBook} className={`px-3 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase flex items-center gap-1 transition-all ${isCheapest ? 'bg-vfm-lime text-black hover:bg-white' : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'}`}>
                                                        View <ChevronRight className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DETAILS TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
                             <div>
                                 <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Description</h3>
                                 <p className="text-sm text-zinc-300 leading-relaxed font-light border-l-2 border-white/10 pl-4">{item.description}</p>
                                 
                                 {isFlight && (
                                     <div className="mt-6 space-y-3">
                                         <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Flight Specs</h3>
                                         <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-white/5">
                                             <span className="text-xs text-zinc-400">Duration</span>
                                             <span className="text-xs font-bold text-white">{flight.duration}</span>
                                         </div>
                                         <div className="flex items-center justify-between p-3 bg-zinc-900 rounded-lg border border-white/5">
                                             <span className="text-xs text-zinc-400">Baggage</span>
                                             <span className="text-xs font-bold text-white flex items-center gap-1"><Luggage className="w-3 h-3" /> {flight.baggageAllowance || '15kg'}</span>
                                         </div>
                                     </div>
                                 )}
                             </div>

                             <div>
                                {isStay && stay.amenities && (
                                    <>
                                         <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Amenities</h3>
                                         <div className="grid grid-cols-2 gap-2">
                                             {stay.amenities.map((am, i) => (
                                                 <div key={i} className="flex items-center gap-2 text-[11px] text-zinc-300 p-2.5 bg-[#121212] rounded-lg border border-white/5">
                                                     {getAmenityIcon(am)}
                                                     <span className="truncate">{am}</span>
                                                 </div>
                                             ))}
                                         </div>
                                    </>
                                )}
                                {isActivity && activity.itinerary && (
                                    <>
                                         <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Highlights</h3>
                                         <div className="space-y-4">
                                             {activity.itinerary.slice(0, 5).map((step, i) => (
                                                 <div key={i} className="flex gap-3">
                                                     <div className="flex flex-col items-center">
                                                         <div className="w-2 h-2 rounded-full bg-vfm-purple mt-1.5"></div>
                                                         {i < activity.itinerary!.length - 1 && <div className="w-px h-full bg-zinc-800 my-1"></div>}
                                                     </div>
                                                     <p className="text-xs text-zinc-300 leading-relaxed py-0.5">{step}</p>
                                                 </div>
                                             ))}
                                         </div>
                                    </>
                                )}
                             </div>
                        </div>
                    )}

                    {/* MAP TAB */}
                    {activeTab === 'map' && (
                        <div className="h-[400px] rounded-2xl overflow-hidden border border-white/10 animate-fade-in relative">
                            <iframe width="100%" height="100%" frameBorder="0" style={{border:0, filter: 'invert(90%) hue-rotate(180deg) contrast(90%)'}} src={mapUrl} allowFullScreen></iframe>
                            <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                                <div className="text-[10px] text-zinc-500 uppercase font-bold">Location</div>
                                <div className="text-sm font-bold text-white">{(item as any).location}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Action Footer */}
            <div className="p-4 md:p-6 bg-[#09090b]/95 backdrop-blur-xl border-t border-white/10 absolute bottom-0 left-0 right-0 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    
                    {/* Price Block (Desktop) */}
                    <div className="hidden md:flex flex-col">
                        <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Total Estimate</div>
                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-display font-bold text-white tracking-tight">{priceDisplay}</span>
                            {item.marketPrice && (<span className="text-sm text-zinc-600 line-through decoration-red-500/50">{item.marketPrice}</span>)}
                        </div>
                    </div>
                    
                    {/* Buttons */}
                    <div className="w-full md:w-auto flex gap-3">
                      <button onClick={onShare} className="w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white transition-colors border border-white/10 group"><Share2 className="w-5 h-5 group-hover:scale-110 transition-transform" /></button>
                      
                      <button onClick={() => setAlertSet(!alertSet)} className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all border border-white/5 group ${alertSet ? 'bg-vfm-lime text-black border-vfm-lime' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}>
                          <Bell className={`w-5 h-5 group-hover:rotate-12 transition-transform ${alertSet ? 'fill-current' : ''}`} />
                      </button>
                      
                      <button onClick={onBook} className="flex-1 md:w-auto px-6 md:px-8 h-12 md:h-14 bg-white hover:bg-vfm-lime text-black font-display font-bold text-base md:text-lg uppercase tracking-wide rounded-2xl transition-all shadow-xl hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] flex items-center justify-center gap-3 group relative overflow-hidden">
                          <span className="relative z-10 flex items-center gap-2">Request Booking <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                      </button>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
