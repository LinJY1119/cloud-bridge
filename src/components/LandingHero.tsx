import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'motion/react';

export default function LandingHero({ onEnter, onNavigate }: { onEnter?: () => void, onNavigate?: (view: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoOpacity, setVideoOpacity] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let rafId: number;

    const checkTime = () => {
      if (!video) return;
      const t = video.currentTime;
      const d = video.duration;

      if (d > 0) {
        if (t < 0.5) {
          setVideoOpacity(t / 0.5);
        } else if (d - t < 0.5) {
          setVideoOpacity(Math.max(0, (d - t) / 0.5));
        } else {
          setVideoOpacity(1);
        }
      }

      rafId = requestAnimationFrame(checkTime);
    };

    const handleEnded = () => {
      setVideoOpacity(0);
      setTimeout(() => {
        if (video) {
          video.currentTime = 0;
          video.play();
        }
      }, 100);
    };

    video.addEventListener('ended', handleEnded);
    video.play().then(() => {
      rafId = requestAnimationFrame(checkTime);
    }).catch(console.error);

    return () => {
      video.removeEventListener('ended', handleEnded);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-white text-black font-sans selection:bg-black selection:text-white">
      {/* Video Background Layer (z-0) */}
      <div className="absolute inset-x-0 bottom-0 z-0 bg-transparent flex flex-col justify-end pointer-events-none" style={{ top: '300px' }}>
        <div className="relative w-full flex-1">
          <video 
            ref={videoRef}
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
            muted
            playsInline
            className="w-full h-full object-cover origin-bottom object-bottom"
            style={{ opacity: videoOpacity, transition: 'opacity 0.1s linear' }}
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
        </div>
      </div>

      {/* Navigation Bar (z-10) */}
      <nav className="relative z-10 flex justify-between items-center px-8 py-6 max-w-7xl mx-auto">
        <div className="text-3xl tracking-tight font-serif text-[#000000] font-bold flex items-center">
          云桥<sup className="font-sans font-normal text-sm ml-1">®</sup>
        </div>
        <div className="hidden md:flex gap-8 text-sm font-medium">
          <button onClick={() => onNavigate?.('landing')} className="text-[#000000] transition-colors">首页</button>
          <button onClick={() => onNavigate?.('child-home')} className="text-[#6F6F6F] hover:text-[#000000] transition-colors">学生端</button>
          <button onClick={() => onNavigate?.('parent')} className="text-[#6F6F6F] hover:text-[#000000] transition-colors">家长端</button>
          <button onClick={() => onNavigate?.('teacher')} className="text-[#6F6F6F] hover:text-[#000000] transition-colors">教师端</button>
          <a href="#" className="text-[#6F6F6F] hover:text-[#000000] transition-colors">关于我们</a>
        </div>
        <button 
          onClick={onEnter} 
          className="rounded-full px-6 py-2.5 text-sm bg-[#000000] text-white hover:scale-105 transition-transform"
        >
          进入学生端
        </button>
      </nav>

      {/* Hero Section (z-10) */}
      <div 
        className="relative z-10 flex flex-col items-center justify-center text-center px-6" 
        style={{ paddingTop: 'calc(8rem - 75px)', paddingBottom: '10rem' }}
      >
        {/* Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl sm:text-7xl md:text-8xl max-w-7xl font-normal font-serif text-[#000000] leading-[0.95] tracking-[-2.46px]"
        >
          云桥 · <em className="not-italic text-[#6F6F6F]">让爱不隔千里</em>
        </motion.h1>
         
        {/* Description */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="text-base sm:text-lg max-w-2xl mt-8 leading-relaxed text-[#6F6F6F]"
        >
          为孩子们打造温暖的数字避风港，让心灵自由呼吸、自由表达。在这里，每一个情绪都会被聆听，每一份成长都会被见证，每一次思念，都有落脚的地方，每一次倾听，都让心更近。
        </motion.p>

        {/* Hero CTA Button */}
        <motion.button 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
          onClick={onEnter}
          className="rounded-full px-14 py-5 text-base mt-12 bg-[#000000] text-[#FFFFFF] hover:scale-105 transition-transform"
        >
          进入学生端
        </motion.button>
      </div>
    </div>
  );
}
