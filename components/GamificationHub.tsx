import React from 'react';
import { UserStats } from '../types';
import { Trophy, Flame, Target, Shield, X, Lock, CheckCircle2, Crown } from 'lucide-react';

interface GamificationHubProps {
    stats: UserStats;
    onClose: () => void;
}

export const GamificationHub: React.FC<GamificationHubProps> = ({ stats, onClose }) => {
    const progressPercent = (stats.xp % 1000) / 10;
    return (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
            <div className="relative w-full max-w-4xl bg-[#121212] border border-vfm-lime/20 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row animate-slide-up md:animate-pop h-[90vh] md:h-auto overflow-y-auto md:overflow-visible">
                <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white z-20"><X className="w-6 h-6" /></button>
                <div className="w-full md:w-1/3 bg-zinc-900/50 p-8 border-b md:border-b-0 md:border-r border-white/5 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vfm-lime via-vfm-purple to-vfm-orange"></div>
                    <div className="flex flex-col items-center text-center relative z-10">
                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-br from-vfm-lime to-vfm-purple mb-4 relative">
                            <div className="w-full h-full bg-[#121212] rounded-full flex items-center justify-center overflow-hidden"><Crown className="w-10 h-10 text-white" /></div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-black rounded-full border-2 border-zinc-800 flex items-center justify-center text-xs font-bold text-white">{stats.level}</div>
                        </div>
                        <h2 className="text-2xl font-display font-bold text-white mb-1">Travel Nomad</h2>
                        <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">Level {stats.level} Member</div>
                        <div className="w-full bg-black/50 rounded-xl p-4 border border-white/5 mb-6">
                            <div className="flex justify-between text-xs text-zinc-400 mb-2"><span>Travel Cred</span><span className="text-vfm-lime font-bold">{stats.xp} XP</span></div>
                            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-vfm-lime transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div></div>
                            <div className="text-[10px] text-right mt-1 text-zinc-600">Next Level: {1000 - (stats.xp % 1000)} XP</div>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex flex-col items-center"><div className="text-xl font-bold text-white flex items-center gap-1"><Flame className="w-4 h-4 text-vfm-orange fill-vfm-orange" /> {stats.streak}</div><div className="text-[10px] text-zinc-500 uppercase">Day Streak</div></div>
                            <div className="w-px h-8 bg-white/10"></div>
                            <div className="flex flex-col items-center"><div className="text-xl font-bold text-white flex items-center gap-1"><Target className="w-4 h-4 text-vfm-purple" /> {stats.searches}</div><div className="text-[10px] text-zinc-500 uppercase">Scouts</div></div>
                        </div>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                </div>
                <div className="w-full md:w-2/3 p-6 md:p-8 bg-[#121212]">
                    <div className="flex items-center gap-3 mb-6"><Trophy className="w-6 h-6 text-vfm-lime" /><h3 className="text-xl font-display font-bold text-white">Active Quests</h3></div>
                    <div className="space-y-4">
                        {stats.quests.map((quest) => (
                            <div key={quest.id} className={`relative p-4 rounded-2xl border transition-all ${quest.completed ? 'bg-vfm-lime/5 border-vfm-lime/30' : 'bg-zinc-900/30 border-white/5'}`}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${quest.completed ? 'bg-vfm-lime text-black' : 'bg-zinc-800 text-zinc-500'}`}>{quest.completed ? <CheckCircle2 className="w-5 h-5" /> : <Shield className="w-5 h-5" />}</div>
                                        <div><h4 className={`font-bold ${quest.completed ? 'text-vfm-lime' : 'text-white'}`}>{quest.title}</h4><p className="text-xs text-zinc-400">{quest.description}</p></div>
                                    </div>
                                    <div className="text-right"><div className="text-sm font-bold text-white">+{quest.reward} XP</div>{quest.completed && <span className="text-[10px] text-vfm-lime font-bold uppercase">Completed</span>}</div>
                                </div>
                                {!quest.completed && (<div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mt-2"><div className="h-full bg-vfm-purple" style={{ width: `${(quest.progress / quest.goal) * 100}%` }}></div></div>)}
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5">
                        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Upcoming Achievements</h4>
                        <div className="flex gap-4">
                            {[1, 2, 3].map((i) => (<div key={i} className="w-16 h-16 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center opacity-50 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-help relative"><Lock className="w-6 h-6 text-zinc-600" /><div className="absolute inset-0 bg-vfm-lime/5 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity"></div></div>))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};