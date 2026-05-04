import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Mic, Send, Image as ImageIcon } from 'lucide-react';
import LiquidGlassBackground from './LiquidGlassBackground';

export default function ChildMessage({ onBack, messages = [], onSendMessage }: { onBack: () => void, messages?: any[], onSendMessage?: (text: string, isParent: boolean) => void }) {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    if (onSendMessage) {
      onSendMessage(inputText, false);
    }
    setInputText('');
  };

  const handleVoiceRecord = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      setInputText('爸爸妈妈我想你们了！');
    }, 2000);
  };

  return (
    <div className="relative w-full h-full font-sans flex flex-col overflow-hidden bg-slate-50 text-slate-800 selection:bg-blue-200 selection:text-blue-900">
      <LiquidGlassBackground />
      {/* Header */}
      <div className="bg-white/30 backdrop-blur-xl px-4 py-4 shadow-sm border-b border-white/50 flex items-center gap-3 z-10">
        <button 
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-slate-700 hover:bg-white/70 transition-colors shadow-sm border border-white/50"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1">
          <h2 className="text-xl font-normal font-serif text-slate-800 tracking-tight">爸爸妈妈</h2>
          <p className="text-[10px] text-slate-500 font-medium tracking-wider uppercase mt-0.5">在线</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10">
        {messages.map((msg) => (
          <motion.div 
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.isParent ? 'justify-start' : 'justify-end'}`}
          >
            <div className={`max-w-[75%] rounded-2xl px-4 py-3 border shadow-sm ${
              msg.isParent 
                ? 'bg-white/60 backdrop-blur-md border-white/50 text-slate-800 rounded-tl-sm' 
                : 'bg-emerald-500 text-white border-transparent rounded-tr-sm'
            }`}>
              <p className="text-[15px] leading-relaxed font-sans">{msg.text}</p>
              <p className={`text-[10px] mt-1.5 text-right font-serif tracking-wide ${msg.isParent ? 'text-slate-500' : 'text-emerald-100'}`}>
                {msg.time}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white/40 backdrop-blur-2xl p-4 border-t border-white/50 z-10">
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center text-slate-700 shrink-0 hover:scale-105 transition-transform border border-white/50 shadow-sm">
            <ImageIcon size={20} />
          </button>
          <div className="flex-1 bg-white/60 backdrop-blur-md rounded-full flex items-center px-4 py-2 border border-white/50 shadow-sm">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="发消息..."
              className="bg-transparent border-none outline-none w-full text-slate-800 placeholder:text-slate-400 font-serif"
            />
          </div>
          {inputText.trim() ? (
            <button 
              onClick={handleSend}
              className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm hover:scale-105 transition-transform"
            >
              <Send size={18} className="translate-x-0.5" />
            </button>
          ) : (
            <button 
              onClick={handleVoiceRecord}
              className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform ${
                isRecording ? 'bg-emerald-400 text-white animate-pulse' : 'bg-white/60 border border-white/50 text-slate-700 shadow-sm hover:scale-105'
              }`}
            >
              <Mic size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
