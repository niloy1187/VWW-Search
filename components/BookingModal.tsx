import React, { useState, useEffect } from 'react';
import { SearchResult, SearchParams } from '../types';
import { X, Calendar, Users, ShieldCheck, Sparkles, Loader2, MessageSquare } from 'lucide-react';

interface BookingModalProps {
  hotel: SearchResult;
  searchParams: SearchParams | null;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ hotel: item, searchParams, onClose, onSubmit }) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', specialRequests: '', checkIn: searchParams?.checkIn || '', guests: searchParams?.guests || 2 });
  
  // Animation State
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false); // Trigger exit animation
    setTimeout(onClose, 500); // Wait for animation (500ms) to finish before unmounting
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setStep('success');
    onSubmit(formData);
  };

  const backdropClass = `fixed inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-500 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`;
  const modalContainerClass = `relative bg-[#121212] border border-white/10 rounded-t-3xl md:rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden max-h-[90vh] overflow-y-auto transform transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-12 scale-95'}`;
  const successModalClass = `relative bg-[#121212] border border-vfm-lime/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(204,255,0,0.1)] text-center transform transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`;

  if (step === 'success') {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className={backdropClass} onClick={handleClose} />
            <div className={successModalClass}>
                <div className="w-20 h-20 bg-vfm-lime/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-vfm-lime/50"><Sparkles className="w-10 h-10 text-vfm-lime animate-pulse" /></div>
                <h2 className="text-3xl font-display font-bold text-white mb-2">Request Sent!</h2>
                <p className="text-zinc-400 mb-6">We are securing your VFM rate for <span className="text-white font-bold">{item.name}</span>. A human concierge will contact you shortly.</p>
                <button onClick={handleClose} className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-wider hover:bg-vfm-lime transition-colors">Awesome, Thanks!</button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center p-0 md:p-6">
      <div className={backdropClass} onClick={handleClose} />
      <div className={modalContainerClass}>
        <button onClick={handleClose} className="absolute top-4 right-4 z-20 p-2 text-zinc-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
        <div className="w-full md:w-2/5 bg-zinc-900/50 border-r border-white/5 p-6 flex flex-col relative shrink-0">
            <div className="relative z-10">
                <div className="text-vfm-lime text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1"><ShieldCheck className="w-4 h-4" /> Secure VFM Booking</div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-white mb-2 leading-tight">{item.name}</h2>
                <p className="text-zinc-400 text-sm mb-6">{item.type === 'flight' ? (item as any).origin + ' -> ' + (item as any).destination : (item as any).location}</p>
                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/5 mb-4"><div className="text-xs text-zinc-500 uppercase mb-1">Total Estimated Price</div><div className="text-2xl font-bold text-white">{item.bookingOptions?.[0]?.price}</div></div>
            </div>
        </div>
        <div className="w-full md:w-3/5 p-6 md:p-8 bg-[#121212]">
            <h3 className="text-lg font-bold text-white mb-6">Confirm Details</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData,name:e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-vfm-lime/50 focus:outline-none" placeholder="Full Name" />
                <div className="grid grid-cols-2 gap-4"><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData,phone:e.target.value})} className="bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-vfm-lime/50 focus:outline-none" placeholder="Phone" /><input type="email" required value={formData.email} onChange={e => setFormData({...formData,email:e.target.value})} className="bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-vfm-lime/50 focus:outline-none" placeholder="Email" /></div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                     <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5"><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Date</label><div className="flex items-center gap-2 text-sm text-white"><Calendar className="w-4 h-4 text-zinc-400" /><input type="date" value={formData.checkIn} onChange={e => setFormData({...formData,checkIn:e.target.value})} className="bg-transparent w-full focus:outline-none [color-scheme:dark]" /></div></div>
                     <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5"><label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{item.type === 'rental' ? 'Seats' : 'Pax'}</label><div className="flex items-center gap-2 text-sm text-white"><Users className="w-4 h-4 text-zinc-400" /><select value={formData.guests} onChange={e => setFormData({...formData,guests:Number(e.target.value)})} className="bg-transparent w-full focus:outline-none appearance-none">{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}</select></div></div>
                </div>
                <div className="pt-2"><div className="bg-zinc-900 border border-white/10 rounded-lg p-3 flex gap-2"><MessageSquare className="w-4 h-4 text-zinc-500 mt-1" /><textarea value={formData.specialRequests} onChange={e => setFormData({...formData,specialRequests:e.target.value})} placeholder="Special requests..." className="bg-transparent w-full text-white text-sm focus:outline-none h-20 resize-none" /></div></div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-white hover:bg-vfm-lime text-black font-display font-bold text-lg py-4 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 mt-4">{isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : 'Request Booking'}</button>
            </form>
        </div>
      </div>
    </div>
  );
};