import React from 'react';
import { Radar, Loader2 } from 'lucide-react';

interface LoadingSkeletonProps {
    message?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ message }) => {
  return (
    <div className="h-[450px] bg-[#18181b] rounded-3xl overflow-hidden border border-white/5 relative flex flex-col shadow-xl">
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer z-0 pointer-events-none" style={{ backgroundSize: '1000px 100%' }} />

        {/* Image Area */}
        <div className="h-48 md:h-64 bg-zinc-900/50 relative flex items-center justify-center overflow-hidden border-b border-white/5">
             {/* Radar Scan Effect */}
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-vfm-lime/5 via-transparent to-transparent animate-pulse" />
             <div className="relative z-10 p-4 rounded-full bg-black/40 backdrop-blur-sm border border-vfm-lime/10">
                <Radar className="w-10 h-10 text-vfm-lime/40 animate-spin" />
             </div>
             
             {/* Dynamic Status Tag */}
             {message && (
                 <div className="absolute bottom-4 left-0 right-0 text-center px-4 animate-slide-up">
                     <div className="inline-block bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-vfm-lime/20 shadow-lg">
                        <span className="text-[10px] font-mono font-bold text-vfm-lime uppercase tracking-widest flex items-center gap-2">
                             <Loader2 className="w-3 h-3 animate-spin" /> {message}
                        </span>
                     </div>
                 </div>
             )}
        </div>
        
        {/* Content Placeholder */}
        <div className="p-5 flex-1 flex flex-col relative z-10 space-y-4">
            {/* Title & Location */}
            <div className="space-y-2">
                <div className="h-7 bg-zinc-800/50 rounded-lg w-3/4 animate-pulse"></div>
                <div className="h-4 bg-zinc-800/30 rounded w-1/2 animate-pulse"></div>
            </div>
            
            {/* Tags */}
            <div className="flex gap-2 pt-1">
                <div className="h-6 w-20 bg-zinc-800/30 rounded border border-white/5 animate-pulse"></div>
                <div className="h-6 w-24 bg-zinc-800/30 rounded border border-white/5 animate-pulse"></div>
            </div>
            
            {/* Smart Hack Block */}
            <div className="bg-vfm-lime/5 border-l-2 border-vfm-lime/10 h-12 w-full rounded-r mt-2 flex items-center px-3">
                 <div className="h-2 w-full bg-vfm-lime/10 rounded animate-pulse"></div>
            </div>
            
            {/* Footer */}
            <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-end">
                 <div className="space-y-1">
                     <div className="h-3 w-16 bg-zinc-800/30 rounded animate-pulse"></div>
                     <div className="h-8 w-24 bg-zinc-800/50 rounded animate-pulse"></div>
                 </div>
                 <div className="h-10 w-32 bg-zinc-800/50 rounded-xl border border-white/5 animate-pulse"></div>
            </div>
        </div>
    </div>
  );
};