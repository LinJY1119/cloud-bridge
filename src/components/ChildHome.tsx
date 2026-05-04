import { Flower2, Phone, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import LiquidGlassBackground from './LiquidGlassBackground';

export default function ChildHome({ onNavigate }: { onNavigate: (view: string) => void }) {
  return (
    <div className="relative w-full h-full font-sans flex flex-col items-center justify-center p-6 text-slate-800 selection:bg-emerald-200 selection:text-emerald-900 overflow-hidden bg-slate-50">
      <LiquidGlassBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-sm space-y-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-5xl font-normal font-serif text-slate-800 mb-3 tracking-tighter">
            <span className="font-sans font-black tracking-tight text-slate-800">云桥</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm tracking-wider uppercase">Welcome back</p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.6)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('child-garden')}
            className="w-full bg-white/50 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all border border-white/80 flex items-center gap-5 group"
          >
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-emerald-600 shadow-sm group-hover:scale-105 transition-transform">
              <Flower2 size={24} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-serif text-slate-800 tracking-tight">我的花园 <span className="text-slate-500 text-sm ml-1">Garden</span></h2>
              <p className="text-slate-500 text-xs mt-1 font-sans">种下心情，孕育希望</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.6)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('child-call')}
            className="w-full bg-white/50 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all border border-white/80 flex items-center gap-5 group"
          >
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-indigo-600 shadow-sm group-hover:scale-105 transition-transform">
              <Phone size={24} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-serif text-slate-800 tracking-tight">打电话 <span className="text-slate-500 text-sm ml-1">Call Voice</span></h2>
              <p className="text-slate-500 text-xs mt-1 font-sans">和小花仙聊聊天</p>
            </div>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.6)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onNavigate('child-message')}
            className="w-full bg-white/50 backdrop-blur-xl p-5 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all border border-white/80 flex items-center gap-5 group"
          >
            <div className="w-12 h-12 bg-white/80 rounded-full flex items-center justify-center text-blue-500 shadow-sm group-hover:scale-105 transition-transform">
              <MessageCircle size={24} strokeWidth={1.5} />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-serif text-slate-800 tracking-tight">发消息 <span className="text-slate-500 text-sm ml-1">Messages</span></h2>
              <p className="text-slate-500 text-xs mt-1 font-sans">给爸爸妈妈留言</p>
            </div>
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
