import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Droplets, Mic, Edit3, X, TreePine, Grid, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';
import LiquidGlassBackground from './LiquidGlassBackground';

const MOOD_PLANTS = {
  joy: { id: 'joy', icon: '😄', emoji: '🌹', name: '玫瑰', color: 'text-red-500', message: '感受到了你的快乐', desc: '让快乐继续绽放吧！' },
  anger: { id: 'anger', icon: '😡', emoji: '🌵', name: '仙人掌', color: 'text-green-600', message: '发现你有点生气', desc: '坏心情会被它的刺扎破哦。' },
  sadness: { id: 'sadness', icon: '😢', emoji: '🪻', name: '风信子', color: 'text-purple-500', message: '检测到你有点低落', desc: '它会静静陪着你度过难过。' },
  calm: { id: 'calm', icon: '😌', emoji: '🌳', name: '小树苗', color: 'text-green-500', message: '觉得你今天很平静', desc: '种下它，慢慢长成参天大树吧。' }
};

export default function ChildGarden({ diaries: propDiaries, onAddDiary, parentAction, onBack }: { diaries?: any[], onAddDiary?: any, parentAction?: any, onBack?: () => void } = {}) {
  const [activeTab, setActiveTab] = useState('garden'); // 'plant' | 'garden'
  const [isDiaryOpen, setIsDiaryOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGrowing, setIsGrowing] = useState(false);
  const [currentSeed, setCurrentSeed] = useState('🌳');
  const [selectedMood, setSelectedMood] = useState<keyof typeof MOOD_PLANTS>('joy');
  
  // Pan & Zoom state
  const [scale, setScale] = useState(1);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // May 2026 (month is 0-indexed)

  // Diary Modal state
  const [selectedDiary, setSelectedDiary] = useState<{date: number, content: string, type: string} | null>(null);
  
  // Mock data for left-behind children (using date strings for dynamic calendar matching)
  const [localDiaries, setLocalDiaries] = useState([
    { dateStr: '2026-04-03', type: '🌹', content: '今天和同学去抓泥鳅，弄得满脸是泥，哈哈哈。' },
    { dateStr: '2026-04-06', type: '🌳', content: '和爷爷学习编竹筐，手被划了一下，但是学到了新本事。' },
    { dateStr: '2026-04-10', type: '🪻', content: '看到别人的爸爸来接他们放学，有点想爸爸了，偷偷哭了一小会儿。' },
    { dateStr: '2026-04-15', type: '🌵', content: '弟弟今天把我的作业本撕坏了，气死我了，我再也不理他了！' },
    { dateStr: '2026-04-20', type: '🌹', content: '收到了妈妈寄来的新衣服，蓝色的，超级漂亮，明天要穿去学校！' },
    { dateStr: '2026-04-24', type: '🌳', content: '下雨了，在屋里画画。画了我们一家人。' },
    { dateStr: '2026-04-28', type: '🪻', content: '家里的老狗生病了，很不舒服，我很担心它。' },
    { dateStr: '2026-05-02', type: '🌹', content: '今天帮奶奶喂了小鸡，很开心！小鸡毛茸茸的。' },
    { dateStr: '2026-05-05', type: '🌳', content: '下雨了，爷爷腿疼，我帮爷爷捶背。希望爸爸早点打工回来。' },
    { dateStr: '2026-05-09', type: '🌵', content: '今天在学校和同桌吵架了，她弄坏了我的橡皮，我很生气。' },
    { dateStr: '2026-05-12', type: '🪻', content: '村里的燕子飞回来了，春天真好看，但是我生病发烧了。' },
    { dateStr: '2026-05-17', type: '🌹', content: '考试考了100分！老师表扬了我，明天周末我想打给妈妈分享！' },
    { dateStr: '2026-05-21', type: '🌵', content: '摔跤了膝盖磕破皮了，好痛，但我没哭。' },
    { dateStr: '2026-05-25', type: '🌳', content: '发现菜园子里的西红柿结果了，绿油油的，好期待它们变红。' },
    { dateStr: '2026-05-30', type: '🌹', content: '快要过儿童节了，老师说要排练节目，我选上了！' }
  ]);

  const diaries = propDiaries || localDiaries;
  const handleAddDiary = onAddDiary || ((newDiary: any) => setLocalDiaries(prev => [...prev, newDiary]));

  const [showParentAction, setShowParentAction] = useState<any>(null);
  const [lastActionText, setLastActionText] = useState<string>("爸爸妈妈一直在悄悄关心你哦~");

  useEffect(() => {
    if (parentAction) {
      setShowParentAction(parentAction);
      const timeStr = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
      const actionMsg = parentAction.type === 'water' ? `爸爸妈妈在 ${timeStr} 帮小花喝了水哦！` : `爸爸妈妈在 ${timeStr} 给你留下了一颗爱心！`;
      setLastActionText(actionMsg);
      const timer = setTimeout(() => setShowParentAction(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [parentAction]);

  // Calendar Math
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const START_DAY_OFFSET = startDay === 0 ? 6 : startDay - 1; // Mon=0, Sun=6
  const DAYS_IN_MONTH = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const ROWS = Math.ceil((START_DAY_OFFSET + DAYS_IN_MONTH) / 7);
  const TOTAL_CELLS = ROWS * 7;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.3, 2.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.3, 0.5));

  const handleSubmit = () => {
    setIsDiaryOpen(false);
    setTimeout(() => setShowFeedback(true), 500);
  };

  const handleRecord = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsRecording(true);
        setTimeout(() => {
          stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
          setInputText("今天帮奶奶喂了小鸡，很开心！");
        }, 3000);
      } else {
        throw new Error("mediaDevices not supported");
      }
    } catch (err) {
      console.error("Microphone access denied or not supported", err);
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInputText("今天帮奶奶喂了小鸡，很开心！(模拟录音)");
      }, 3000);
    }
  };

  const handleAcceptSeed = () => {
    setShowFeedback(false);
    const plant = MOOD_PLANTS[selectedMood];
    setCurrentSeed(plant.emoji);
    setActiveTab('plant');
    
    setTimeout(() => {
      setIsGrowing(true);
      setTimeout(() => {
        // Plant on "today" (e.g., May 15, 2026)
        const todayDateStr = '2026-05-15';
        
        if (!diaries.find((d: any) => d.dateStr === todayDateStr)) {
          handleAddDiary({ dateStr: todayDateStr, type: plant.emoji, content: inputText || `今天种下了一颗${plant.name}。` });
        }
        
        setIsGrowing(false);
        setTimeout(() => setActiveTab('garden'), 500);
      }, 3000);
    }, 300);
  };

  return (
    <div className="relative w-full h-full overflow-hidden font-sans flex flex-col transition-colors duration-700 bg-slate-50 text-slate-800 selection:bg-emerald-200 selection:text-emerald-900">
      <LiquidGlassBackground />
      
      {/* Parent Action Feedback Overlay */}
      <AnimatePresence>
        {showParentAction && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-28 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
          >
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-md flex items-center gap-2 border border-white/60">
              <span className="font-medium text-sm text-[#3DA07D]">
                {showParentAction.type === 'water' ? '收到爸爸妈妈浇的水啦！💧' : '收到爸爸妈妈的爱心啦！❤️'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="flex justify-between items-center pt-12 px-6 pb-0 z-20 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center text-slate-700 hover:bg-white transition-colors shadow-sm border border-slate-200"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-slate-200">
            <Star size={14} className="text-amber-400" fill="currentColor" />
            <span className="font-bold text-slate-700 text-xs font-serif tracking-wide">Lv.3</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full pointer-events-auto shadow-sm border border-slate-200">
          <Droplets size={14} className="text-blue-400" fill="currentColor" />
          <span className="font-bold text-slate-700 text-xs font-serif tracking-wide">128</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-center mt-4 z-20 relative pointer-events-none">
        <div className="bg-white/50 p-1 rounded-full flex gap-1 backdrop-blur-xl pointer-events-auto shadow-inner border border-white">
          <button 
            onClick={() => setActiveTab('plant')} 
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 font-serif tracking-wide ${activeTab === 'plant' ? 'bg-emerald-500 text-white shadow-sm flex-1 justify-center' : 'text-slate-500 hover:text-slate-700 flex-1 justify-center'}`}
          >
            <TreePine size={16} /> 种花
          </button>
          <button 
            onClick={() => setActiveTab('garden')} 
            className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 font-serif tracking-wide ${activeTab === 'garden' ? 'bg-emerald-500 text-white shadow-sm flex-1 justify-center' : 'text-slate-500 hover:text-slate-700 flex-1 justify-center'}`}
          >
            <Grid size={16} /> 花园
          </button>
        </div>
      </div>

      {/* Month Selector */}
      {activeTab === 'garden' && (
        <div className="flex items-center justify-center gap-6 mt-6 z-20 relative pointer-events-auto">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center text-slate-700 hover:bg-white transition-colors shadow-sm border border-slate-200"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-slate-800 bg-white/90 px-4 py-1.5 rounded-full border border-slate-200 shadow-sm font-normal font-serif text-2xl tracking-tight">
            {currentMonth.getFullYear()}<span className="font-sans text-lg mx-0.5">年</span>{currentMonth.getMonth() + 1}<span className="font-sans text-lg mx-0.5">月</span>
          </span>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center text-slate-700 hover:bg-white transition-colors shadow-sm border border-slate-200"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 relative z-10">
        <AnimatePresence mode="wait">
          {activeTab === 'plant' ? (
            <motion.div 
              key="plant" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }} 
              className="absolute inset-0 flex flex-col items-center justify-center pb-20"
            >
              <div className="text-white/90 text-lg font-medium mb-8 tracking-wider">
                {isGrowing ? '正在吸收坏心情...' : '今天心情怎么样？'}
              </div>
              
              {/* Forest Circle */}
              <div className="relative w-72 h-72 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
                  <circle 
                    cx="50" cy="50" r="48" fill="none" stroke="#fff" strokeWidth="4" 
                    strokeDasharray="301.59" 
                    strokeDashoffset={isGrowing ? 0 : 301.59} 
                    className="transition-all duration-[3000ms] ease-linear" 
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-4 bg-[#52C49D] rounded-full shadow-[inset_0_0_20px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center overflow-hidden border-4 border-[#3DA07D]">
                  <div className="absolute bottom-12 w-40 h-16 bg-[#8D6E63] rounded-[100%] opacity-90 shadow-inner" />
                  
                  <AnimatePresence mode="wait">
                    {!isGrowing ? (
                      <motion.div 
                        key="seed"
                        initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 20 }} exit={{ opacity: 0, scale: 0.5 }}
                        className="text-5xl z-10 drop-shadow-md opacity-50 grayscale"
                      >
                        🌱
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="flower"
                        initial={{ scale: 0, y: 40 }} animate={{ scale: 1.2, y: 10 }}
                        transition={{ duration: 3, type: "tween", ease: "easeOut" }}
                        className="text-7xl z-10 drop-shadow-xl"
                      >
                        {currentSeed}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {!isGrowing && (
                <div className="absolute bottom-10">
                  <motion.button 
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => setIsDiaryOpen(true)}
                    className="px-10 py-4 bg-white text-[#45B08C] rounded-full font-bold text-lg shadow-[0_8px_20px_rgba(0,0,0,0.15)] flex items-center gap-2"
                  >
                    <Edit3 size={20} /> 记录心情
                  </motion.button>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="garden" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }} 
              className="absolute inset-0 overflow-hidden"
            >
              {/* Draggable & Zoomable Container */}
              <motion.div 
                drag
                dragConstraints={{ left: -1000, right: 1000, top: -1000, bottom: 1000 }}
                className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
                style={{ scale }}
              >
                {/* The Isometric Landmass (Dynamic Calendar Grid) */}
                <div className="relative w-[350px] -mt-16" style={{ height: `${ROWS * 50}px`, transform: 'rotateX(60deg) rotateZ(-45deg)', transformStyle: 'preserve-3d' }}>
                  
                  {/* Top Face (Grass Grid) */}
                  <div className="absolute inset-0 bg-[#A2D149] grid grid-cols-7 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]" style={{ gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`, transformStyle: 'preserve-3d' }}>
                    {[...Array(TOTAL_CELLS)].map((_, i) => {
                      const isDay = i >= START_DAY_OFFSET && i < START_DAY_OFFSET + DAYS_IN_MONTH;
                      const dayNum = i - START_DAY_OFFSET + 1;
                      
                      let diary = null;
                      if (isDay) {
                        const currentYear = currentMonth.getFullYear();
                        const currentMonthNum = currentMonth.getMonth() + 1;
                        const dateStr = `${currentYear}-${String(currentMonthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                        diary = diaries.find(d => d.dateStr === dateStr);
                      }

                      return (
                        <div key={i} className="border-[0.5px] border-[#8CB83A]/30 flex items-center justify-center relative" style={{ transformStyle: 'preserve-3d' }}>
                          {/* Calendar Day Number (Lies flat on the grid) */}
                          {isDay && (
                            <span className="absolute top-1.5 left-2 text-xs font-bold text-white/60 z-10">
                              {dayNum}
                            </span>
                          )}

                          {/* Grass tuft detail */}
                          {i % 4 === 0 && <div className="w-2 h-1 border-b border-l border-[#8CB83A]/50 rounded-bl-full absolute bottom-2 left-2" style={{ transform: 'rotate(-15deg)' }} />}
                          
                          {/* Upright Tree/Flower */}
                          {diary && (
                            <div 
                              className="absolute inset-0 flex items-center justify-center pointer-events-none"
                              // Counter-transform to face the screen directly, with Z-translation to prevent clipping
                              style={{ 
                                transform: 'rotateZ(45deg) rotateX(-60deg) translateY(-25px) translateZ(20px)', 
                                transformOrigin: 'center bottom',
                                transformStyle: 'preserve-3d' 
                              }}
                            >
                              <motion.div 
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="text-[64px] leading-none drop-shadow-2xl origin-bottom pointer-events-auto cursor-pointer hover:scale-110 transition-transform"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedDiary({ ...diary, date: dayNum });
                                }}
                              >
                                {diary.type}
                              </motion.div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Left Face (Dirt) */}
                  <div className="absolute top-0 right-full w-[30px] h-full bg-[#634832] origin-right" style={{ transform: 'rotateY(-90deg)' }}>
                    <div className="absolute top-0 right-0 w-[6px] h-full bg-[#8CB83A]" />
                    <div className="absolute top-1/4 right-2 w-4 h-2 bg-[#4A3525] rounded-full opacity-50" />
                    <div className="absolute top-2/3 right-1 w-5 h-3 bg-[#4A3525] rounded-full opacity-50" />
                  </div>

                  {/* Bottom Face (Dirt) */}
                  <div className="absolute top-full left-0 w-full h-[30px] bg-[#7A5C43] origin-top" style={{ transform: 'rotateX(-90deg)' }}>
                    <div className="absolute top-0 left-0 w-full h-[6px] bg-[#8CB83A]" />
                    <div className="absolute left-1/4 top-2 w-4 h-2 bg-[#5C4532] rounded-full opacity-50" />
                    <div className="absolute left-2/3 top-1 w-5 h-3 bg-[#5C4532] rounded-full opacity-50" />
                  </div>
                </div>
              </motion.div>

              {/* Zoom Controls */}
              <div className="absolute right-6 bottom-20 flex flex-col gap-3 z-20">
                <button onClick={handleZoomIn} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-lg border border-white/10">
                  <ZoomIn size={20} />
                </button>
                <button onClick={handleZoomOut} className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors shadow-lg border border-white/10">
                  <ZoomOut size={20} />
                </button>
              </div>

              {/* Scrolling text at bottom right */}
              <div className="absolute bottom-6 right-6 w-48 overflow-hidden pointer-events-none bg-emerald-900/30 backdrop-blur-sm rounded-full py-1.5 flex items-center">
                <motion.div 
                  key={lastActionText}
                  animate={{ x: ['100%', '-100%'] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="whitespace-nowrap text-white/90 text-xs font-medium px-2"
                >
                  {lastActionText}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Diary Entry Modal */}
      <AnimatePresence>
        {selectedDiary && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setSelectedDiary(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] p-6 w-full max-w-[300px] shadow-2xl relative"
            >
              <button 
                onClick={() => setSelectedDiary(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1.5 transition-colors"
              >
                <X size={16} />
              </button>
              
              <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
                <div className="text-4xl">{selectedDiary.type}</div>
                <div>
                  <h3 className="font-bold text-gray-800">{currentMonth.getMonth() + 1}月{selectedDiary.date}日</h3>
                  <span className="text-xs text-gray-500">心情日记</span>
                </div>
              </div>
              
              <p className="text-gray-700 text-sm leading-relaxed min-h-[80px]">
                {selectedDiary.content}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Write Diary Bottom Sheet */}
      <AnimatePresence>
        {isDiaryOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-30"
              onClick={() => setIsDiaryOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[2rem] p-6 z-40 shadow-2xl"
            >
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-6" />
              <h2 className="text-lg font-bold text-gray-800 text-center mb-4">今天心情怎么样？</h2>

              {/* Mood Selector */}
              <div className="flex justify-between mb-6 px-2">
                {(Object.keys(MOOD_PLANTS) as Array<keyof typeof MOOD_PLANTS>).map((moodKey) => {
                  const mood = MOOD_PLANTS[moodKey];
                  return (
                    <button
                      key={moodKey}
                      onClick={() => setSelectedMood(moodKey)}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${selectedMood === moodKey ? 'bg-blue-50 scale-110 shadow-sm' : 'grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                    >
                      <span className="text-3xl">{mood.icon}</span>
                      <span className={`text-xs font-bold ${selectedMood === moodKey ? 'text-blue-600' : 'text-gray-500'}`}>{mood.name}</span>
                    </button>
                  );
                })}
              </div>
              
              <div className="flex gap-4 justify-center mb-6">
                <button className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-2xl bg-[#E3F0FF] text-blue-500 flex items-center justify-center shadow-sm">
                    <Edit3 size={24} />
                  </div>
                  <span className="text-gray-600 text-xs font-medium">写一写</span>
                </button>
                <button 
                  onClick={handleRecord}
                  className="flex flex-col items-center gap-2 relative"
                >
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-colors ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-[#FFE8E8] text-red-400'}`}>
                    <Mic size={24} />
                  </div>
                  <span className="text-gray-600 text-xs font-medium">{isRecording ? '录音中...' : '说一说'}</span>
                </button>
              </div>

              <textarea 
                className="w-full bg-gray-50 rounded-2xl p-4 outline-none text-gray-700 text-sm resize-none h-24 mb-4"
                placeholder="把开心或不开心的事都装进日记本吧..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <button 
                onClick={handleSubmit}
                className="w-full py-3 rounded-full bg-[#45B08C] text-white font-bold text-sm shadow-md active:scale-95 transition-transform"
              >
                放进日记本
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Feedback Modal */}
      <AnimatePresence>
        {showFeedback && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-md z-50 flex items-center justify-center p-6"
            >
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="bg-white rounded-[2rem] p-6 max-w-[280px] w-full text-center shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowFeedback(false)}
                  className="absolute top-3 right-3 text-gray-400 bg-gray-100 rounded-full p-1.5 hover:bg-gray-200 transition-colors"
                >
                  <X size={16} />
                </button>
                <div className="text-5xl mb-4 animate-bounce">🎁</div>
                <h3 className="text-base font-bold text-gray-800 mb-2">魔法盒开启！</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  AI {MOOD_PLANTS[selectedMood].message}，送你一颗<span className={`font-bold ${MOOD_PLANTS[selectedMood].color}`}>【{MOOD_PLANTS[selectedMood].name}】</span>种子，种下它，{MOOD_PLANTS[selectedMood].desc}
                </p>
                <button 
                  onClick={handleAcceptSeed}
                  className="w-full py-3 rounded-full bg-[#FFD166] text-white font-bold text-sm shadow-md active:scale-95 transition-transform"
                >
                  去种花
                </button>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
