import React, { useState } from 'react';
import { SearchResult, SearchParams } from '../types';
import { X, Calendar, Users, CheckCircle2, ShieldCheck, CreditCard, Sparkles, Loader2, MessageSquare } from 'lucide-react';

interface BookingModalProps {
  hotel: SearchResult;
  searchParams: SearchParams | null;
  onClose: () => void;
  onSubmit: (formData: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ hotel: item, searchParams, onClose, onSubmit }) => {
  const [step, setStep] = useState<'details' | 'success'>('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
    checkIn: searchParams?.checkIn || '',
    guests: searchParams?.guests || 2
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setStep('success');
    onSubmit(formData);
  };

  const getLabel = () => {
      switch(item.type) {
          case 'flight': return 'Flight';
          case 'rental': return 'Rental';
          case 'activity': return 'Ticket';
          default: return 'Stay';
      }
  };

  if (step === 'success') {
    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
            <div className="relative bg-[#121212] border border-vfm-lime/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(204,255,0,0.1)] animate-pop text-center">
                <div className="w-20 h-20 bg-vfm-lime/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-vfm-lime/50">
                    <Sparkles className="w-10 h-10 text-vfm-lime animate-pulse" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white mb-2">Request Sent!</h2>
                <p className="text-zinc-400 mb-6">
                    We are securing your VFM rate for <span className="text-white font-bold">{item.name}</span>. A human concierge will contact you shortly.
                </p>
                <button onClick={onClose} className="w-full bg-white text-black font-bold py-4 rounded-xl uppercase tracking-wider hover:bg-vfm-lime transition-colors">
                    Awesome, Thanks!
                </button>
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      
      <div className="relative bg-[#121212] border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-up">
        <button onClick={onClose} className="absolute top-4 right-4 z-20 p-2 text-zinc-500 hover:text-white transition-colors">
            <X className="w-6 h-6" />
        </button>

        {/* Left Col: Summary */}
        <div className="w-full md:w-2/5 bg-zinc-900/50 border-r border-white/5 p-6 flex flex-col relative">
            <div className="relative z-10">
                <div className="text-vfm-lime text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" /> Secure VFM {getLabel()}
                </div>
                <h2 className="text-2xl font-display font-bold text-white mb-2 leading-tight">{item.name}</h2>
                <p className="text-zinc-400 text-sm mb-6">
                   {item.type === 'flight' ? (item as any).origin + ' -> ' + (item as any).destination : (item as any).location}
                </p>

                <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/5 mb-4">
                    <div className="text-xs text-zinc-500 uppercase mb-1">Total Estimated Price</div>
                    <div className="text-2xl font-bold text-white">{item.bookingOptions?.[0]?.price || 'Check Price'}</div>
                </div>
            </div>
        </div>

        {/* Right Col: Form */}
        <div className="w-full md:w-3/5 p-6 md:p-8 bg-[#121212]">
            <h3 className="text-lg font-bold text-white mb-6">Confirm Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-vfm-lime/50 focus:outline-none" placeholder="Full Name" />
                
                <div className="grid grid-cols-2 gap-4">
                     <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-vfm-lime/50 focus:outline-none" placeholder="Phone" />
                     <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-vfm-lime/50 focus:outline-none" placeholder="Email" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                     <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Date</label>
                        <div className="flex items-center gap-2 text-sm text-white">
                            <Calendar className="w-4 h-4 text-zinc-400" />
                            <input type="date" value={formData.checkIn} onChange={e => setFormData({...formData, checkIn: e.target.value})} className="bg-transparent w-full focus:outline-none [color-scheme:dark]" />
                        </div>
                     </div>
                     <div className="bg-zinc-900/50 rounded-lg p-3 border border-white/5">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">{item.type === 'rental' ? 'Seats' : 'Pax'}</label>
                        <div className="flex items-center gap-2 text-sm text-white">
                            <Users className="w-4 h-4 text-zinc-400" />
                            <select value={formData.guests} onChange={e => setFormData({...formData, guests: Number(e.target.value)})} className="bg-transparent w-full focus:outline-none appearance-none">
                                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                            </select>
                        </div>
                     </div>
                </div>

                <div className="pt-2">
                    <div className="bg-zinc-900 border border-white/10 rounded-lg p-3 flex gap-2">
                        <MessageSquare className="w-4 h-4 text-zinc-500 mt-1" />
                        <textarea 
                            value={formData.specialRequests}
                            onChange={e => setFormData({...formData, specialRequests: e.target.value})}
                            placeholder="Special requests (e.g. Early check-in, veg meals, window seat...)" 
                            className="bg-transparent w-full text-white text-sm focus:outline-none h-20 resize-none"
                        />
                    </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="w-full bg-white hover:bg-vfm-lime text-black font-display font-bold text-lg py-4 rounded-xl uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 mt-4">
                    {isSubmitting ? <Loader2 className="animate-spin w-5 h-5"/> : 'Request Booking'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};