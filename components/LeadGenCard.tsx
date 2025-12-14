
import React, { useState } from 'react';
import { Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

export const LeadGenCard: React.FC = () => {
    const [email, setEmail] = useState('');
    const [sent, setSent] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSent(true);
    };

    return (
        <div className="bg-gradient-to-br from-zinc-900 to-[#050505] rounded-3xl border border-white/10 p-8 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-vfm-lime/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-24 h-24 bg-vfm-purple/20 rounded-full flex items-center justify-center relative"><UserCheck className="w-10 h-10 text-vfm-purple" /><div className="absolute top-0 right-0 w-8 h-8 bg-vfm-lime rounded-full flex items-center justify-center animate-bounce"><Sparkles className="w-4 h-4 text-black" /></div></div>
            </div>
            <div className="w-full md:w-2/3 relative z-10 text-center md:text-left">
                <h3 className="text-2xl font-display font-bold text-white mb-2">Can't find the perfect VFM stay?</h3>
                <p className="text-zinc-400 mb-6 max-w-md">Our human concierge team will scout the best unpublished deals for you within 24 hours. Free for members.</p>
                {!sent ? (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" /><input type="email" placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-vfm-lime/50" required /></div>
                        <button type="submit" className="px-6 py-3 bg-white text-black font-bold rounded-xl hover:bg-vfm-lime transition-colors flex items-center justify-center gap-2">Scout For Me <ArrowRight className="w-4 h-4" /></button>
                    </form>
                ) : (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl font-bold flex items-center justify-center gap-2 animate-fade-in"><UserCheck className="w-5 h-5" /> Request Received! We're on it.</div>
                )}
            </div>
        </div>
    );
};
