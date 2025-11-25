
import React, { useState } from 'react';
import { MapPin, Users, ArrowRight, Laptop, Sparkles, IndianRupee, Backpack, PartyPopper, Mail, Crown, Calendar, CheckSquare, Plane, Car, Tent, Briefcase, Clock, ArrowRightLeft } from 'lucide-react';
import { SearchParams, UserStats, SearchCategory } from '../types';

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

const VIBES = ['Chill', 'Party', 'Adventure', 'Romantic', 'Spiritual', 'Offbeat'];

export const Hero: React.FC<HeroProps> = ({ onSearch, isSearching, userStats }) => {
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('stays');
  
  // Form States
  const [location, setLocation] = useState(''); // Dest or Pick-up
  const [origin, setOrigin] = useState(''); // Flights
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [isFlexible, setIsFlexible] = useState(false);
  const [guests, setGuests] = useState(2);
  const [maxPrice, setMaxPrice] = useState<number>(10000);
  const [vibe, setVibe] = useState('');
  const [squadTrip, setSquadTrip] = useState(false);
  const [workation, setWorkation] = useState(false);
  
  // Flight Specific
  const [tripType, setTripType] = useState<'oneway' | 'roundtrip'>('roundtrip');

  // Rental Specific
  const [pickupTime, setPickupTime] = useState('10:00');
  const [dropoffTime, setDropoffTime] = useState('10:00');
  
  // Lead Magnet State
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!location && activeCategory !== 'flights') return; 
    
    onSearch({ 
      category: activeCategory,
      location,
      origin: activeCategory === 'flights' ? origin : undefined,
      checkIn,
      checkOut: activeCategory === 'flights' && tripType === 'oneway' ? undefined : checkOut,
      pickupTime: activeCategory === 'rentals' ? pickupTime : undefined,
      dropoffTime: activeCategory === 'rentals' ? dropoffTime : undefined,
      tripType: activeCategory === 'flights' ? tripType : undefined,
      isFlexible,
      guests, 
      maxPrice,
      vibe: vibe || undefined,
      squadTrip,
      workation
    });
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setEmailSubmitted(true);
  };

  return (
    <div className="relative pt-32 pb-16 px-4 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-vfm-purple/20 via-transparent to-transparent z-0 pointer-events-none" />
      <div className="absolute top-[-100px] right-[-100px] w-96 h-96 bg-vfm-lime/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto">
        
        {/* Header Copy */}
        <div className="text-center mb-10 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-vfm-lime/10 border border-vfm-lime/20 mb-6 backdrop-blur-sm">
                <Crown className="w-3 h-3 text-vfm-lime" />
                <span className="text-xs font-bold uppercase tracking-widest text-vfm-lime">An Exclusive PALATE PILGRIM Offering</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[0.9] tracking-tighter mb-4">
                Value<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vfm-lime to-emerald-400">WanderWeavers.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-light">
                The AI companion for <span className="text-white font-medium">smart travel</span>. Stays, Flights, Hacks & More.
            </p>
        </div>

        {/* Lead Magnet */}
        <div className="max-w-xl mx-auto mb-10 hidden md:block">
            {!emailSubmitted ? (
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                    <div className="relative flex-1">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input 
                            type="email" 
                            placeholder="Enter email for Weekly Travel Hacks"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-transparent border-none text-white placeholder-zinc-500 pl-10 pr-4 py-3 focus:outline-none focus:ring-0 text-sm font-sans"
                            required
                        />
                    </div>
                    <button type="submit" className="px-6 py-3 bg-vfm-purple hover:bg-vfm-purple/80 text-white text-sm font-bold rounded-xl transition-all whitespace-nowrap">
                        Unlock Guide
                    </button>
                </form>
            ) : (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-2xl text-green-400 text-sm font-bold text-center flex items-center justify-center gap-2 animate-fade-in">
                    <Sparkles className="w-4 h-4" /> You're in! Cheat Sheet sent to {email}.
                </div>
            )}
        </div>

        {/* Search Module */}
        <div className="max-w-5xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-vfm-lime via-vfm-purple to-vfm-orange rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
            
            <div className="relative bg-[#121212] border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                
                {/* Tabs */}
                <div className="flex overflow-x-auto scrollbar-hide gap-2 pb-2 border-b border-white/5">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat.id ? 'bg-white text-black' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Dynamic Fields */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                        
                        {/* 1. Location / Origin / Dest */}
                        {activeCategory === 'flights' ? (
                             <>
                                <div className="lg:col-span-3 relative group/input">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 ml-1 block">From</label>
                                    <input type="text" placeholder="DEL / Mumbai" value={origin} onChange={(e) => setOrigin(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-vfm-lime/50 transition-all font-sans" />
                                </div>
                                <div className="lg:col-span-3 relative group/input">
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 ml-1 block">To</label>
                                    <input type="text" placeholder="Goa / London" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 px-4 text-white focus:outline-none focus:border-vfm-lime/50 transition-all font-sans" />
                                </div>
                             </>
                        ) : (
                            <div className="lg:col-span-4 relative group/input">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 ml-1 block">
                                    {activeCategory === 'rentals' ? 'Pick-up City' : 'Destination'}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-vfm-lime transition-colors">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Goa, Manali, etc." 
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 pl-12 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:border-vfm-lime/50 transition-all font-sans"
                                    />
                                </div>
                            </div>
                        )}

                        {/* 2. Dates & Times */}
                        <div className="lg:col-span-5 relative group/input">
                             <div className="flex justify-between items-center mb-1 ml-1">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 block">Dates</label>
                                
                                {/* Flight Toggle */}
                                {activeCategory === 'flights' && (
                                    <div className="flex bg-zinc-800 rounded-lg p-0.5">
                                        <button type="button" onClick={() => setTripType('oneway')} className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${tripType === 'oneway' ? 'bg-white text-black' : 'text-zinc-500'}`}>One Way</button>
                                        <button type="button" onClick={() => setTripType('roundtrip')} className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all ${tripType === 'roundtrip' ? 'bg-white text-black' : 'text-zinc-500'}`}>Round Trip</button>
                                    </div>
                                )}
                                
                                {activeCategory !== 'flights' && (
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <div className={`w-3 h-3 rounded-sm border ${isFlexible ? 'bg-vfm-lime border-vfm-lime' : 'border-zinc-600'} flex items-center justify-center`}>
                                            {isFlexible && <CheckSquare className="w-2.5 h-2.5 text-black" />}
                                        </div>
                                        <input type="checkbox" checked={isFlexible} onChange={(e) => setIsFlexible(e.target.checked)} className="hidden" />
                                        <span className="text-[10px] text-zinc-400 font-medium">Flexible</span>
                                    </label>
                                )}
                             </div>
                             
                             <div className="flex gap-2">
                                 {/* Check In / Pickup Date */}
                                 <div className="relative flex-1">
                                    <input type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-vfm-lime/50 transition-all [color-scheme:dark]" />
                                    {activeCategory === 'rentals' && (
                                         <input type="time" value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-[10px] text-zinc-400 border-none focus:ring-0 w-16 text-right" />
                                    )}
                                 </div>
                                 
                                 {/* Check Out / Dropoff Date */}
                                 {/* Logic: If Flight && OneWay -> Hide/Disable */}
                                 <div className={`relative flex-1 transition-all ${activeCategory === 'flights' && tripType === 'oneway' ? 'opacity-30 pointer-events-none grayscale' : 'opacity-100'}`}>
                                    <input 
                                        type="date" 
                                        value={checkOut} 
                                        onChange={(e) => setCheckOut(e.target.value)} 
                                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 px-4 text-sm text-white focus:outline-none focus:border-vfm-lime/50 transition-all [color-scheme:dark]" 
                                        disabled={activeCategory === 'flights' && tripType === 'oneway'}
                                    />
                                    {activeCategory === 'rentals' && (
                                         <input type="time" value={dropoffTime} onChange={(e) => setDropoffTime(e.target.value)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent text-[10px] text-zinc-400 border-none focus:ring-0 w-16 text-right" />
                                    )}
                                 </div>
                             </div>
                        </div>

                        {/* 3. Guests / Type */}
                        <div className={`${activeCategory === 'flights' ? 'lg:col-span-2' : 'lg:col-span-3'} relative group/input`}>
                            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 ml-1 block">
                                {activeCategory === 'rentals' ? 'Seats' : 'Travelers'}
                            </label>
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within/input:text-vfm-lime transition-colors">
                                    <Users className="w-5 h-5" />
                                </div>
                                <select 
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                    className="w-full bg-zinc-900/50 border border-white/10 rounded-xl h-12 pl-12 pr-4 text-white appearance-none cursor-pointer focus:outline-none focus:border-vfm-lime/50 transition-all font-sans [&>option]:bg-zinc-900 text-sm"
                                >
                                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} {activeCategory === 'rentals' ? 'Seats' : 'Pax'}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Filters & Actions */}
                    <div className="flex flex-col lg:flex-row gap-6 p-4 bg-zinc-900/30 rounded-2xl border border-white/5 items-center">
                        
                        {/* Budget */}
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-center text-xs mb-2">
                                <span className="text-zinc-400 font-medium flex items-center gap-1"><IndianRupee className="w-3 h-3"/> Max Budget</span>
                                <span className="text-white font-bold">₹{maxPrice.toLocaleString()}</span>
                            </div>
                            <input type="range" min="1000" max="50000" step="1000" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full h-1.5 bg-zinc-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-vfm-lime [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:scale-125 transition-all" />
                        </div>

                        {/* Vibe (Only for relevant cats) */}
                        {['stays', 'activities', 'packages'].includes(activeCategory) && (
                            <div className="flex-1 w-full overflow-hidden">
                                <div className="text-xs text-zinc-400 font-medium mb-2">Vibe Check</div>
                                <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                                    {VIBES.map(v => (
                                        <button key={v} type="button" onClick={() => setVibe(v === vibe ? '' : v)} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap border transition-all ${v === vibe ? 'bg-vfm-purple text-white border-vfm-purple' : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500'}`}>
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Toggles */}
                        <div className="flex gap-2">
                             <button type="button" onClick={() => setSquadTrip(!squadTrip)} className={`p-2 rounded-lg border transition-all ${squadTrip ? 'bg-vfm-orange/20 border-vfm-orange text-vfm-orange' : 'bg-transparent border-zinc-700 text-zinc-500'}`} title="Squad Mode"><PartyPopper className="w-5 h-5" /></button>
                            <button type="button" onClick={() => setWorkation(!workation)} className={`p-2 rounded-lg border transition-all ${workation ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-transparent border-zinc-700 text-zinc-500'}`} title="Workation Ready"><Laptop className="w-5 h-5" /></button>
                        </div>

                        {/* Search Button */}
                        <button 
                            type="submit"
                            disabled={isSearching}
                            className="w-full lg:w-auto px-8 py-3 bg-white hover:bg-vfm-lime text-black font-display font-bold text-lg rounded-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg min-w-[200px]"
                        >
                            {isSearching ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    <span>Scanning...</span>
                                </>
                            ) : (
                                <>
                                    Search <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* Stats Ticker */}
        <div className="mt-12 flex justify-center gap-8 text-zinc-500 text-sm font-mono overflow-hidden">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>{userStats.searches * 12 + 450} Wanderers Online</span>
            </div>
            <div className="flex items-center gap-2 hidden md:flex">
                <Backpack className="w-4 h-4" />
                <span>{userStats.streak} Day Streak</span>
            </div>
        </div>
      </div>
    </div>
  );
};
