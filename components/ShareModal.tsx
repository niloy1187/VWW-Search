import React, { useState } from 'react';
import { X, Copy, Check, Share2, MessageCircle, Send, Twitter, Link as LinkIcon } from 'lucide-react';
import { SearchResult } from '../types';

interface ShareModalProps {
  item: SearchResult;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = window.location.href;
  const price = item.bookingOptions?.[0]?.price || 'Check Price';
  const text = `Found this insane VFM deal on Value WanderWeavers! 🌍\n\n🏨 ${item.name}\n💰 ${price} (Best Deal)\n⭐ ${item.vfmScore}/10 Value Score\n⚡ Hack: ${item.smartHack || 'Secret rates available'}\n\nCheck it out here:`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${text} ${shareUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
      if (navigator.share) {
          try {
              await navigator.share({
                  title: `VFM Deal: ${item.name}`,
                  text: text,
                  url: shareUrl
              });
              onClose();
          } catch (err) {
              console.log("Share failed/cancelled");
          }
      } else {
          handleCopy();
      }
  };

  const shareLinks = [
    { 
      name: 'WhatsApp', 
      icon: MessageCircle, 
      color: 'bg-[#25D366]', 
      url: `https://wa.me/?text=${encodeURIComponent(text + ' ' + shareUrl)}` 
    },
    { 
      name: 'Telegram', 
      icon: Send, 
      color: 'bg-[#0088cc]', 
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(text)}` 
    },
    { 
      name: 'X / Twitter', 
      icon: Twitter, 
      color: 'bg-black', 
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}` 
    },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={onClose} />
      <div className="relative bg-[#18181b] border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-pop">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center mb-6">
            <div className="w-full h-32 rounded-2xl overflow-hidden mb-4 relative">
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg text-[10px] font-bold text-white uppercase tracking-wider border border-white/10">VFM Score: {item.vfmScore}</div>
            </div>
          <h3 className="text-xl font-display font-bold text-white text-center leading-tight mb-1">{item.name}</h3>
          <p className="text-sm text-zinc-400 text-center max-w-[80%]">Share this deal with your squad.</p>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {shareLinks.map((link) => (
            <a 
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`${link.color} w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 border border-white/10`}>
                <link.icon className="w-5 h-5 text-white fill-current" />
              </div>
            </a>
          ))}
            <button 
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="bg-zinc-800 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110 border border-white/10">
                {navigator.share ? <Share2 className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              </div>
            </button>
        </div>

        <div className="bg-zinc-900/50 rounded-xl p-3 border border-white/5 flex items-center gap-3">
          <LinkIcon className="w-4 h-4 text-zinc-500 shrink-0" />
          <div className="flex-1 truncate text-xs text-zinc-500 font-mono select-all">
            {shareUrl}
          </div>
          <button 
            onClick={handleCopy}
            className={`p-1.5 rounded-lg transition-all ${copied ? 'bg-vfm-lime text-black' : 'bg-zinc-800 text-white hover:bg-zinc-700'}`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};