import React, { useRef, useEffect, useState } from 'react';

export default function LiquidGlassBackground() {
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
    <div className="absolute inset-0 z-0 bg-white overflow-hidden pointer-events-none flex flex-col justify-end">
      <div className="relative w-full h-full flex-1">
        <video 
          ref={videoRef}
          src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
          muted
          playsInline
          className="w-full h-full object-cover object-center"
          style={{ opacity: videoOpacity, transition: 'opacity 0.1s linear' }}
        />
        {/* Gradient Overlay to blend with content above and bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 via-transparent to-white/40 backdrop-blur-[2px]" />
      </div>
    </div>
  );
}
