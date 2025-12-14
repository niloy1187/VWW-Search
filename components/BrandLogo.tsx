import React from 'react';
import { Compass, Mountain, Sun, Star } from 'lucide-react';

export const BrandLogo: React.FC<{ size?: 'sm' | 'lg' | 'hero' }> = ({ size = 'sm' }) => {
  const isHero = size === 'hero';
  const isLg = size === 'lg';
  
  if (isHero) {
      return (
        <div className="flex flex-col items-center justify-center animate-fade-in select-none">
            <div className="relative mb-6 group cursor-pointer perspective-1000">
                {/* Compass/Star/Mountain Motif */}
                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-vfm-lime/20 flex items-center justify-center relative bg-black/20 backdrop-blur-sm overflow-hidden transition-all duration-700 group-hover:border-vfm-lime/50 group-hover:shadow-[0_0_50px_rgba(204,255,0,0.2)]">
                    <div className="absolute inset-0 bg-gradient-to-tr from-vfm-orange/20 via-transparent to-vfm-lime/20 opacity-50 group-hover:rotate-45 transition-transform duration-1000"></div>
                    <Star className="w-full h-full text-vfm-lime/10 absolute animate-spin-slow" strokeWidth={0.5} />
                    <div className="relative z-10 flex flex-col items-center text-vfm-lime transition-transform duration-500 group-hover:scale-110">
                        <Mountain className="w-12 h-12 md:w-16 md:h-16 fill-current opacity-80" strokeWidth={1} />
                        <div className="w-full h-1 bg-current mt-1 rounded-full opacity-50"></div>
                        <div className="w-2/3 h-0.5 bg-current mt-1 rounded-full opacity-30"></div>
                    </div>
                    <Sun className="absolute top-4 right-8 w-6 h-6 text-vfm-orange animate-pulse" fill="currentColor" />
                </div>
            </div>
            
            {/* Brand Text */}
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-display text-center text-white tracking-tight leading-[0.9] mb-6 drop-shadow-2xl">
                VALUE <br className="md:hidden" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-vfm-lime via-white to-vfm-lime animate-gradient-x bg-[length:200%_auto]">WANDERWEAVERS</span>
            </h1>
            
            <div className="flex flex-col items-center gap-3">
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-vfm-lime to-transparent opacity-50"></div>
                <div className="text-sm md:text-xl font-display tracking-[0.2em] text-zinc-300 uppercase text-center font-light">
                    Authentic Journeys Await
                </div>
                <div className="text-[10px] md:text-xs font-bold tracking-[0.25em] text-vfm-lime uppercase font-sans border border-vfm-lime/20 px-4 py-1.5 rounded-full bg-vfm-lime/5 backdrop-blur-md shadow-[0_0_20px_rgba(204,255,0,0.1)] hover:bg-vfm-lime/10 transition-colors">
                    An Exclusive PALATE PILGRIM Offering
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="flex items-center gap-3 group cursor-pointer select-none">
        <div className={`relative flex items-center justify-center border border-vfm-lime/30 rounded-full bg-black/50 backdrop-blur-md transition-all duration-500 group-hover:border-vfm-lime group-hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] ${isLg ? 'w-16 h-16' : 'w-10 h-10'}`}>
            <Star className={`text-vfm-lime absolute ${isLg ? 'w-12 h-12' : 'w-8 h-8'} opacity-20 animate-spin-slow`} />
            <Mountain className={`text-white relative z-10 ${isLg ? 'w-8 h-8' : 'w-5 h-5'} transition-transform group-hover:scale-110`} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col">
            <span className={`font-display font-bold text-white leading-none ${isLg ? 'text-2xl' : 'text-lg'} group-hover:text-vfm-lime transition-colors`}>
                Value WanderWeavers
            </span>
            <span className={`text-zinc-500 font-bold uppercase ${isLg ? 'text-[10px]' : 'text-[8px]'} tracking-[0.15em] mt-0.5 group-hover:text-zinc-300 transition-colors`}>
                An Exclusive PALATE PILGRIM Offering
            </span>
        </div>
    </div>
  );
};