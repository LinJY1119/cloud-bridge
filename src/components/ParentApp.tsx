import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, X, Calendar, CalendarDays, Sprout, Heart, Lock, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import LiquidGlassBackground from './LiquidGlassBackground';

export default function ParentApp({ diaries: propDiaries, onAction, messages = [], onSendMessage }: { diaries?: any[], onAction?: (type: 'water'|'heart') => void, messages?: any[], onSendMessage?: (text: string, isParent: boolean) => void } = {}) {
  const [inputText, setInputText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiGeneratedOptions, setAiGeneratedOptions] = useState<{title: string, text: string}[] | null>(null);
  const [reportType, setReportType] = useState('daily'); // daily, weekly
  const [inGarden, setInGarden] = useState(false);

  // Garden State
  const [scale, setScale] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 4, 1)); // May 2026
  const [selectedFlower, setSelectedFlower] = useState<{dateStr: string, type: string} | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{type: 'water' | 'heart', message: string} | null>(null);

  // Use shared diaries or fallback to mock data
  const diaries = propDiaries || [
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
  ];

  // Calendar Math
  const startDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const START_DAY_OFFSET = startDay === 0 ? 6 : startDay - 1; // Mon=0, Sun=6
  const DAYS_IN_MONTH = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const ROWS = Math.ceil((START_DAY_OFFSET + DAYS_IN_MONTH) / 7);
  const TOTAL_CELLS = ROWS * 7;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.3, 2.5));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.3, 0.5));

  const handleSend = () => {
    if (!inputText.trim()) return;
    if (onSendMessage) {
      onSendMessage(inputText, true);
    }
    setInputText('');
  };

  const handleAiSuggest = async () => {
    setIsGenerating(true);
    setAiGeneratedOptions(null);
    setShowSuggestions(true);
    try {
      let apiKey = '';
      try {
        apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      } catch (e) {}
      if (!apiKey) {
        try {
          // @ts-ignore
          apiKey = process.env.GEMINI_API_KEY;
        } catch (e) {}
      }

      if (!apiKey || apiKey === 'YOUR_API_KEY') {
        throw new Error('Missing or invalid Gemini API Key. Please add VITE_GEMINI_API_KEY to your deployment environment variables.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const historyText = messages.map(m => `${m.isParent ? '家长' : '孩子'}: ${m.text}`).join('\n');
      const prompt = `你是一个留守儿童的家庭教育助手。请根据以下家长和孩子的聊天记录，为家长生成2条不同角度的回复建议（例如：安慰共情、鼓励引导等，每条50字以内）。\n\n请严格按照以下JSON数组格式返回，不要有其他多余文字：\n[\n  {"title": "安慰共情", "text": "建议内容..."},\n  {"title": "鼓励引导", "text": "建议内容..."}\n]\n\n聊天记录：\n${historyText}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const options = JSON.parse(response.text || '[]');
      setAiGeneratedOptions(options);
    } catch (error) {
      console.error("AI Suggestion Error:", error);
      setAiGeneratedOptions([
        { title: "安慰共情", text: "宝贝，今天是不是有遇到烦心事呀？妈妈下班了，我们通个电话好不好？" },
        { title: "鼓励引导", text: "妈妈看到你种出了仙人掌，你能把生气记录下来很棒！周末我们要不要一起玩个线上画画？" }
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWater = () => {
    if (onAction) onAction('water');
    setActionFeedback({ type: 'water', message: '浇水成功！宝贝的花园更生机勃勃了 🌱' });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const handleHeart = () => {
    if (onAction) onAction('heart');
    setActionFeedback({ type: 'heart', message: '爱心已送达！宝贝会感受到你的爱 ❤️' });
    setTimeout(() => setActionFeedback(null), 3000);
  };

  if (inGarden) {
    return (
      <div className="relative w-full h-full overflow-hidden font-sans flex flex-col bg-white text-black selection:bg-black selection:text-white">
        <LiquidGlassBackground />
        {/* Top Bar */}
        <div className="absolute top-12 left-4 z-20">
          <button onClick={() => setInGarden(false)} className="bg-white/90 backdrop-blur-xl px-4 py-2 rounded-full text-sm font-bold text-black shadow-sm flex items-center gap-1 hover:bg-white transition-colors border border-black/10 font-serif tracking-wide">
            <X size={16} /> 返回聊天
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center gap-6 mt-28 z-20 relative pointer-events-auto">
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center text-black hover:bg-white transition-colors shadow-sm border border-black/10"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-black bg-white/90 px-4 py-1.5 rounded-full border border-black/10 shadow-sm font-normal font-serif text-2xl tracking-tight">
            {currentMonth.getFullYear()}<span className="font-sans text-lg mx-0.5">年</span>{currentMonth.getMonth() + 1}<span className="font-sans text-lg mx-0.5">月</span>
          </span>
          <button 
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}
            className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-xl flex items-center justify-center text-black hover:bg-white transition-colors shadow-sm border border-black/10"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative z-10">
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
                      {/* Calendar Day Number */}
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
                              setSelectedFlower(diary);
                              setRequestSent(false);
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
          <div className="absolute right-6 bottom-24 flex flex-col gap-3 z-20">
            <button onClick={handleZoomIn} className="w-10 h-10 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center text-slate-600 hover:bg-white transition-colors shadow-sm border border-emerald-100">
              <ZoomIn size={20} />
            </button>
            <button onClick={handleZoomOut} className="w-10 h-10 bg-white/90 backdrop-blur-xl rounded-full flex items-center justify-center text-slate-600 hover:bg-white transition-colors shadow-sm border border-emerald-100">
              <ZoomOut size={20} />
            </button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 z-20">
          <button onClick={handleHeart} className="bg-white/90 backdrop-blur-xl px-6 py-3 rounded-full shadow-sm font-bold text-slate-700 flex items-center gap-2 border border-pink-100 hover:bg-white transition-colors">
            <Heart size={18} className="text-pink-500" /> 留个爱心
          </button>
          <button onClick={handleWater} className="bg-emerald-500 px-6 py-3 rounded-full shadow-sm font-bold text-white flex items-center gap-2 border border-emerald-600 hover:bg-emerald-600 transition-colors">
            <Sprout size={18} /> 帮浇水
          </button>
        </div>

        {/* Action Feedback Overlay */}
        <AnimatePresence>
          {actionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center"
            >
              <div className="bg-white/90 backdrop-blur-md px-5 py-2.5 rounded-full shadow-xl font-bold text-gray-800 text-sm border border-white/50 whitespace-nowrap">
                {actionFeedback.message}
              </div>
              
              <div className="absolute top-full mt-2 flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ 
                      y: actionFeedback.type === 'water' ? 60 : -60, 
                      opacity: 0, 
                      scale: 1.5,
                      x: (i - 1) * 15
                    }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.15 }}
                    className="text-2xl drop-shadow-md"
                  >
                    {actionFeedback.type === 'water' ? '💧' : '❤️'}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Privacy Modal */}
        <AnimatePresence>
          {selectedFlower && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setSelectedFlower(null)}
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.9, y: 20, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[2rem] p-6 w-full max-w-[300px] shadow-2xl relative flex flex-col items-center text-center"
              >
                <button 
                  onClick={() => setSelectedFlower(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 rounded-full p-1.5 transition-colors"
                >
                  <X size={16} />
                </button>
                
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mt-2">
                  <Lock size={32} className="text-gray-400" />
                </div>
                
                <h3 className="font-bold text-gray-800 text-lg mb-2">日记已上锁</h3>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">
                  宝贝为这篇日记设置了隐私保护。<br/>需要发送请求，同意后才能查看哦。
                </p>

                {requestSent ? (
                  <div className="w-full py-3 rounded-full bg-green-50 text-green-600 font-bold text-sm border border-green-200">
                    请求已发送，等待同意
                  </div>
                ) : (
                  <button 
                    onClick={() => setRequestSent(true)}
                    className="w-full py-3 rounded-full bg-blue-500 text-white font-bold text-sm shadow-md hover:bg-blue-600 transition-colors active:scale-95"
                  >
                    发送查看请求
                  </button>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-slate-50 text-slate-800 selection:bg-indigo-200 selection:text-indigo-900">
      {/* Header */}
      <div className="bg-white/60 backdrop-blur-xl px-4 py-3 pt-12 shadow-sm flex justify-between items-center z-10 border-b border-white/80">
        <div className="w-8" />
        <h1 className="font-normal font-serif text-slate-800 text-xl tracking-tight">小雨 <span className="text-sm font-sans tracking-wide text-slate-500 ml-1">(宝贝)</span></h1>
        <button onClick={() => setInGarden(true)} className="text-emerald-600 bg-emerald-50 border border-emerald-100 p-2 rounded-full hover:bg-emerald-100 transition-colors shadow-sm">
          <Sprout size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 z-10">
        
        {/* Report Tabs */}
        <div className="flex justify-center mb-2">
          <div className="bg-white/60 backdrop-blur-md p-1 rounded-full flex gap-1 border border-white/80 shadow-sm">
            <button 
              onClick={() => setReportType('daily')}
              className={`px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all font-serif tracking-wide ${reportType === 'daily' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <Calendar size={14} /> 日报
            </button>
            <button 
              onClick={() => setReportType('weekly')}
              className={`px-4 py-1.5 rounded-full text-xs flex items-center gap-1.5 transition-all font-serif tracking-wide ${reportType === 'weekly' ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'}`}
            >
              <CalendarDays size={14} /> 周报
            </button>
          </div>
        </div>

        {/* System Report */}
        <div className={`rounded-2xl p-5 border shadow-sm ${reportType === 'daily' ? 'bg-white/80 border-white backdrop-blur-md' : 'bg-white/60 border-white backdrop-blur-md'}`}>
          <div className={`flex items-center gap-1.5 font-bold mb-3 text-sm font-serif tracking-wide text-indigo-600`}>
            <Sparkles size={16} />
            <span>{reportType === 'daily' ? '今日情绪日报' : '本周情绪周报'}</span>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed font-sans">
            {reportType === 'daily' 
              ? <>今天小雨种出了 <span className="font-bold text-slate-800 border-b border-indigo-200">1朵仙人掌（生气）</span>，可能在学校遇到了小挫折。建议晚上聊聊。</>
              : <>本周小雨种出了 <span className="font-bold text-slate-800 border-b border-indigo-200">2朵仙人掌（生气）</span>，情绪波动集中在周三。建议周末多陪伴。</>
            }
          </p>
          <button onClick={() => setInGarden(true)} className="mt-4 text-xs font-serif font-bold text-indigo-600 flex items-center gap-1 hover:underline">
            进入花园看看 <Sprout size={12} />
          </button>
        </div>

        {/* Messages */}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${!msg.isParent ? 'justify-start' : 'justify-end'}`}>
            <div className={`p-3 border shadow-[0_4px_20px_rgb(0,0,0,0.05)] rounded-2xl max-w-[80%] text-sm ${
              !msg.isParent 
                ? 'bg-white border-white text-slate-800 rounded-tl-sm' 
                : 'bg-indigo-500 text-white border-transparent rounded-tr-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="bg-white/80 backdrop-blur-2xl p-4 border-t border-white/80 rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
        {/* AI Suggestion Button */}
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAiSuggest}
          disabled={isGenerating}
          className="w-full mb-3 py-3 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 text-sm font-serif tracking-wide flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 transition-colors hover:bg-indigo-100"
        >
          <Sparkles size={16} className={isGenerating ? "animate-spin" : "animate-pulse"} />
          ✨ 帮我想想怎么回
        </motion.button>

        <div className="flex gap-2">
          <input 
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="输入回复..."
            className="flex-1 bg-white border border-slate-200 rounded-full px-4 py-2 outline-none text-slate-800 placeholder:text-slate-400 font-serif tracking-wide shadow-sm"
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-sm shrink-0 transition-transform hover:scale-105"
          >
            <Send size={16} className="translate-x-px" />
          </button>
        </div>
      </div>

      {/* Suggestions Bottom Sheet */}
      <AnimatePresence>
        {showSuggestions && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm z-30"
              onClick={() => setShowSuggestions(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[1.5rem] p-5 z-40"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800 text-sm flex items-center gap-1.5">
                  <Sparkles size={16} className="text-purple-500" />
                  高情商回复建议
                </h3>
                <button onClick={() => setShowSuggestions(false)} className="p-1.5 bg-gray-100 rounded-full text-gray-500">
                  <X size={14} />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                {isGenerating ? (
                  <div className="py-8 flex flex-col items-center justify-center text-[#6F6F6F] gap-2">
                    <Sparkles size={24} className="animate-spin text-black" />
                    <span className="text-xs font-serif tracking-wide">AI 正在为您生成专属回复...</span>
                  </div>
                ) : aiGeneratedOptions ? (
                  aiGeneratedOptions.map((opt, idx) => (
                    <button 
                      key={idx}
                      onClick={() => { setInputText(opt.text); setShowSuggestions(false); }}
                      className="text-left p-4 rounded-[1.5rem] border transition-colors bg-white/60 border-white/50 hover:bg-white backdrop-blur-md shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                    >
                      <div className="text-xs font-serif font-bold mb-1.5 text-black">【{opt.title}】</div>
                      <div className="text-[#6F6F6F] text-xs font-sans leading-relaxed">{opt.text}</div>
                    </button>
                  ))
                ) : null}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
