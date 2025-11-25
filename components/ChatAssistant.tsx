
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Bot, Sparkles, Minus, Zap } from 'lucide-react';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse } from '@google/genai';

interface Message {
    role: 'user' | 'model';
    text: string;
}

export const ChatAssistant: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);
    
    const chatSessionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const SUGGESTIONS = ["Plan a squad trip to Goa", "Find cheap flights to Bangkok", "Suggest a hidden gem", "Workation spots nearby"];

    useEffect(() => {
        const timer = setTimeout(() => {
            if (messages.length === 0) {
                setHasUnread(true);
                setMessages([{ role: 'model', text: "Yo! I'm Vex. ⚡ I judge bad travel plans and find you sick deals. Where we going?" }]);
            }
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
        if (!isOpen) setHasUnread(false);
    };

    const handleSend = async (text: string) => {
        if (!text.trim()) return;

        const userMsg = text;
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsTyping(true);

        try {
            if (!chatSessionRef.current) {
                chatSessionRef.current = createChatSession();
            }

            const result = await chatSessionRef.current.sendMessageStream({ message: userMsg });
            
            let fullResponse = "";
            setMessages(prev => [...prev, { role: 'model', text: "" }]);

            for await (const chunk of result) {
                const text = (chunk as GenerateContentResponse).text;
                if (text) {
                    fullResponse += text;
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        newMsgs[newMsgs.length - 1].text = fullResponse;
                        return newMsgs;
                    });
                }
            }

        } catch (error) {
            console.error("Chat error", error);
            setMessages(prev => [...prev, { role: 'model', text: "Brain freeze. 🥶 My bad, try again?" }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end pointer-events-none">
            
            {/* Chat Window */}
            <div className={`pointer-events-auto bg-[#18181b]/95 backdrop-blur-xl border border-vfm-lime/30 rounded-3xl shadow-2xl w-[350px] md:w-[400px] mb-4 overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-10 pointer-events-none h-0'}`}>
                {/* Header */}
                <div className="bg-gradient-to-r from-vfm-lime/20 to-vfm-purple/20 p-4 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-vfm-lime flex items-center justify-center border-2 border-black relative shadow-lg">
                            <Zap className="w-6 h-6 text-black fill-black" />
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-black animate-pulse"></div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-white font-display font-bold text-base">Vex</h3>
                                <span className="px-1.5 py-0.5 rounded bg-white/10 text-[9px] font-bold uppercase text-vfm-lime border border-vfm-lime/20">AI Nomad</span>
                            </div>
                            <div className="text-[10px] text-zinc-400 font-medium">Replies instantly • Sassy but helpful</div>
                        </div>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg">
                        <Minus className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="h-[400px] overflow-y-auto p-4 custom-scrollbar bg-black/40 flex flex-col gap-4">
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {msg.role === 'model' && (
                                <div className="w-6 h-6 rounded-full bg-vfm-lime/20 flex items-center justify-center shrink-0 border border-vfm-lime/10">
                                    <Zap className="w-3 h-3 text-vfm-lime" />
                                </div>
                            )}
                            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-white text-black font-medium rounded-tr-none' 
                                : 'bg-zinc-800 text-zinc-200 border border-white/5 rounded-tl-none'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                         <div className="flex items-end gap-2">
                             <div className="w-6 h-6 rounded-full bg-vfm-lime/20 flex items-center justify-center shrink-0 border border-vfm-lime/10">
                                <Zap className="w-3 h-3 text-vfm-lime" />
                            </div>
                            <div className="bg-zinc-800 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-100"></span>
                                <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce delay-200"></span>
                            </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions (Only if empty or last msg was model) */}
                {!isTyping && (messages.length === 0 || messages[messages.length-1].role === 'model') && (
                    <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
                        {SUGGESTIONS.map(s => (
                            <button key={s} onClick={() => handleSend(s)} className="whitespace-nowrap px-3 py-1.5 bg-white/5 hover:bg-vfm-lime/20 border border-white/10 hover:border-vfm-lime/30 rounded-full text-[10px] text-zinc-300 hover:text-vfm-lime transition-all">
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form onSubmit={(e) => { e.preventDefault(); handleSend(inputValue); }} className="p-3 bg-[#18181b] border-t border-white/10 flex gap-2">
                    <input 
                        type="text" 
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Talk to Vex..."
                        className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-vfm-lime/50 transition-colors placeholder-zinc-600"
                    />
                    <button 
                        type="submit" 
                        disabled={!inputValue.trim() || isTyping}
                        className="bg-vfm-lime hover:bg-white disabled:opacity-50 disabled:hover:bg-vfm-lime text-black p-3 rounded-xl transition-colors shadow-lg shadow-vfm-lime/10"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* FAB */}
            <button 
                onClick={handleOpen}
                className={`pointer-events-auto group relative w-16 h-16 rounded-full bg-vfm-lime hover:scale-110 active:scale-95 transition-all duration-300 shadow-[0_0_30px_rgba(204,255,0,0.3)] flex items-center justify-center border-4 border-[#050505] z-[9999] ${isOpen ? 'rotate-90 bg-zinc-800 border-zinc-700' : ''}`}
            >
                {isOpen ? (
                    <X className="w-8 h-8 text-white" />
                ) : (
                    <>
                        <Zap className="w-8 h-8 text-black fill-black" />
                        {hasUnread && (
                            <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 rounded-full border-2 border-[#050505] flex items-center justify-center">
                                <span className="w-full h-full animate-ping absolute bg-red-400 rounded-full opacity-75"></span>
                                <span className="relative text-[10px] font-bold text-white">1</span>
                            </span>
                        )}
                        <span className="absolute -top-12 right-0 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none">
                            Ask Vex ⚡
                        </span>
                    </>
                )}
            </button>
        </div>
    );
};
