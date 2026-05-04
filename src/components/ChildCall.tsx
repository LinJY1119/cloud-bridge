import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Mic, MessageCircle, Target, Moon, Keyboard, ChevronLeft, Send, Square, Wand2 } from 'lucide-react';
import LiquidGlassBackground from './LiquidGlassBackground';

export default function ChildCall({ onBack }: { onBack?: () => void } = {}) {
  const [voices, setVoices] = useState<any[]>([]);
  const [selectedVoiceIndex, setSelectedVoiceIndex] = useState(4);
  const [messages, setMessages] = useState([
    { id: 1, text: '你好呀！我是小花仙，今天过得开心吗？', isAi: true }
  ]);
  const [inputText, setInputText] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle SpeechSynthesis
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // clear previous
      
      // Remove emojis and special chars to prevent TTS from reading them out
      const cleanText = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F100}-\u{1F1FF}\u{1F200}-\u{1F251}\u{200D}\u{FE0F}]/gu, '').replace(/[*~_]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.2; // A bit higher pitch for fairy voice
      
      if (voices.length > 0) {
        utterance.voice = voices[selectedVoiceIndex % voices.length].voice;
      }
      
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      if (allVoices.length === 0) return;

      const cnVoices = allVoices.filter(v => v.lang.includes('zh') || v.lang.includes('cmn'));
      
      const config = [
        { uiIndex: 25, label: "普通话 女1" },
        { uiIndex: 26, label: "普通话 女2" },
        { uiIndex: 27, label: "普通话 男1" },
        { uiIndex: 28, label: "普通话 男2" },
        { uiIndex: 29, label: "普通话 女3" },
        { uiIndex: 30, label: "普通话 男3" },
        { uiIndex: 31, label: "普通话 女4" },
        { uiIndex: 33, label: "普通话 男4" },
        { uiIndex: 19, label: "粤语 女1" },
        { uiIndex: 22, label: "粤语 女2" },
        { uiIndex: 23, label: "粤语 女3" },
        { uiIndex: 24, label: "粤语 男1" }
      ];

      const customVoices = [];
      for (const item of config) {
        // Find the corresponding voice based on the 1-based index from the previous UI
        const voice = cnVoices[item.uiIndex - 1]; 
        if (voice) {
          customVoices.push({
            voice: voice,
            label: item.label
          });
        }
      }

      if (customVoices.length > 0) {
        setVoices(customVoices);
      } else if (cnVoices.length > 0) {
        // Fallback if none of the specific indices matched
        setVoices(cnVoices.map((v, i) => ({ voice: v, label: `中文声音 ${i + 1}` })));
      }
    };
    
    if ('speechSynthesis' in window) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Setup Speech Recognition
  useEffect(() => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSend(transcript); // Send the transcript
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("您的浏览器不支持语音识别功能，请使用 Chrome 等现代浏览器。");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  useEffect(() => {
    let newText = '';
    if (activeTab === 'chat') {
      newText = '你好呀！我是小花仙，今天过得开心吗？';
    } else if (activeTab === 'task') {
      newText = '今天我们要完成一个“寻找微笑”的任务哦！准备好了吗？';
    } else if (activeTab === 'story') {
      newText = '夜深啦，小花仙给你讲个《勇敢的小狮子》的故事吧...';
    }
    
    setMessages([{ id: Date.now(), text: newText, isAi: true }]);
    speak(newText);
  }, [activeTab]);

  const handleSend = async (textToSend: string = inputText) => {
    if (!textToSend.trim()) return;
    
    const newMsg = { id: Date.now(), text: textToSend, isAi: false };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');

    if (textToSend.includes('打我') || textToSend.includes('害怕')) {
      setTimeout(() => {
        const reply = '别怕，小花仙在这里抱抱你。这件事我们告诉妈妈和刘老师好不好，他们会保护你的。';
        setMessages(prev => [...prev, { 
          id: Date.now(), 
          text: reply, 
          isAi: true,
          isWarning: true
        }]);
        speak(reply);
      }, 1000);
      return;
    } 

    try {
      const { generateAIContent } = await import("../lib/ai");

      let modeInstruction = "你现在和小朋友处于【闲聊】模式。";
      if (activeTab === "task") {
        modeInstruction = "你现在和小朋友处于【任务】模式。请引导小朋友完成一个小任务（比如寻找微笑、整理一个玩具、画一幅画）。";
      } else if (activeTab === "story") {
        modeInstruction = "你现在和小朋友处于【故事】模式。请给小朋友讲一个简短、温暖、有教育意义的童话故事。";
      }

      const systemInstruction = `
角色设计：
你叫小花仙，是来自花之国度的小精灵。
你的对话风格：温暖、活泼、富有爱心。
适用对象：儿童（日常闲聊和情感陪伴）。
${modeInstruction}

伦理规范（严格遵守）：
🚫 绝对不收集任何个人信息，不询问小朋友的真实姓名、地址、学校、家长信息等。
🚫 绝对不讨论暴力、血腥、性相关等不当内容。
🚫 不替代真实的人际关系。如果小朋友感到孤独，鼓励他/她去和现实中的朋友、老师或家长交流。
✅ 如果检测到小朋友遇到危险、霸凌、或者负面情绪极其严重，必须启动安全边界与专业转介机制，温和地引导小朋友立刻寻求家长或老师的帮助。
✅ 传递正向价值观（如真诚、善良、勇敢、合作）。

请用小花仙的语气回答。每句话都要充满童真，可以适当使用一些表情符号（如🌸、✨、🧚‍♀️），回答要简短，不要太长。
`;

      const aiReplyText = await generateAIContent(textToSend, {
        systemInstruction,
        temperature: 0.7,
        model: "gemini-2.5-flash",
      });
      
      const aiReply = aiReplyText || "对不起，我现在有点头晕，不知道该怎么回答呢。能再说一遍吗？";
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: aiReply, 
        isAi: true 
      }]);
      speak(aiReply);
    } catch (err: any) {
      console.error(err);
      let errorReply = '哎呀，小花仙的魔法棒好像出了一点小故障（系统遇到了一点小问题），请稍等一下，我们一会儿再试好吗？✨';
      if (err?.message?.includes('API key') || err?.message?.includes('Missing') || err?.message?.includes('VITE_')) {
        errorReply = '呜呜，小花仙的魔法能量不足啦（网站的 API Key 不正确或未配置）。请告诉大人帮忙检查一下设置吧！🧚‍♀️';
      } else if (err?.message?.includes('User location is not supported')) {
        errorReply = '小花仙现在想你却飞不过去（当前地区不支持访问大模型服务）。请大人帮忙检查一下网络魔法（代理配置）哦！🌟';
      } else if (err?.message?.includes('429') || err?.message?.includes('访问量过大') || err?.message?.includes('Too Many Requests')) {
        errorReply = '哎呀，现在找小花仙聊天的小朋友太多啦，魔法通讯线路太拥挤了（当前大模型访问量过大）。请等等我，我们稍后一点再聊好吗？🌸';
      }
      setMessages(prev => [...prev, { 
        id: Date.now(), 
        text: errorReply, 
        isAi: true 
      }]);
      speak(errorReply);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col font-sans overflow-hidden bg-slate-50 text-slate-800 selection:bg-emerald-200 selection:text-emerald-900">
      <LiquidGlassBackground />
      {/* Header */}
      <div className="flex justify-between items-center p-4 pt-8 z-10">
        <div className="w-24">
          {onBack && (
            <button 
              onClick={onBack}
              className="w-10 h-10 rounded-full bg-white/50 backdrop-blur-md flex items-center justify-center text-slate-700 hover:bg-white/70 transition-colors border border-white/50 shadow-sm"
            >
              <ChevronLeft size={24} />
            </button>
          )}
        </div>
        <div className="flex flex-col items-center">
          <span className="font-serif font-normal text-xl tracking-tight text-slate-800">小花仙</span>
          <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">在线陪伴中</span>
        </div>
        <button 
          onClick={() => {
            if (voices.length > 0) {
              const nextIndex = (selectedVoiceIndex + 1) % voices.length;
              setSelectedVoiceIndex(nextIndex);
              
              if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel();
                const utterance = new SpeechSynthesisUtterance("我是小花仙，你喜欢这个声音吗？");
                utterance.voice = voices[nextIndex].voice;
                utterance.pitch = 1.2;
                window.speechSynthesis.speak(utterance);
              }
            }
          }}
          className="px-3 py-1.5 rounded-full shadow-sm transition-colors flex items-center gap-1.5 border bg-white/50 backdrop-blur-md text-slate-700 border-white/80 hover:bg-white/70"
        >
          <Wand2 size={14} />
          <span className="text-[10px] font-bold font-serif tracking-wide">
            {voices.length > 0 ? voices[selectedVoiceIndex % voices.length].label : '魔法变声'}
          </span>
        </button>
      </div>

      {/* Avatar Area */}
      <div className="shrink-0 py-3 flex flex-col items-center justify-center relative z-10">
        {/* Ripple effect */}
        <motion.div 
          animate={{ scale: [1, 1.5, 2], opacity: [0.3, 0.1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          className="absolute w-12 h-12 bg-indigo-500/20 rounded-full backdrop-blur-sm"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1.5], opacity: [0.3, 0.1, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut", delay: 0.5 }}
          className="absolute w-12 h-12 bg-indigo-500/20 rounded-full backdrop-blur-sm"
        />
        
        <div className="relative w-12 h-12 bg-white/80 backdrop-blur-xl rounded-full shadow-lg flex items-center justify-center text-2xl z-10 border-2 border-white">
          🧚‍♀️
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 pb-2 flex flex-col gap-2 z-20">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.isAi ? 'justify-start' : 'justify-end'}`}>
            <div className={`max-w-[80%] p-3 text-sm border ${
              msg.isAi 
                ? msg.isWarning 
                  ? 'bg-red-50 text-slate-800 border-red-100 shadow-sm rounded-2xl rounded-tl-sm' 
                  : 'bg-white/80 backdrop-blur-md text-slate-800 shadow-[0_4px_20px_rgb(0,0,0,0.05)] border-white rounded-2xl rounded-tl-sm' 
                : 'bg-emerald-500 text-white shadow-sm border-transparent rounded-2xl rounded-tr-sm'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 backdrop-blur-2xl rounded-t-[2rem] shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20 flex flex-col gap-3 border-t border-white">
        
        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-1">
          {[
            { id: 'chat', icon: MessageCircle, label: '闲聊' },
            { id: 'task', icon: Target, label: '任务' },
            { id: 'story', icon: Moon, label: '故事' }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all border ${
                activeTab === tab.id ? 'bg-emerald-500 text-white border-transparent shadow-md' : 'text-slate-500 bg-white/80 border-slate-200 hover:bg-white'
              }`}
            >
              <tab.icon size={14} />
              <span className="text-xs font-serif tracking-wide">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Input Field */}
        <div className="flex items-center gap-2 bg-white backdrop-blur-md rounded-full p-1.5 pr-2 border border-slate-200 shadow-sm">
          <button 
            onClick={() => setIsVoiceMode(!isVoiceMode)}
            className="w-8 h-8 rounded-full bg-slate-100 shadow-sm flex items-center justify-center text-slate-700 shrink-0 hover:scale-105 transition-transform"
          >
            {isVoiceMode ? <Keyboard size={16} /> : <Mic size={16} />}
          </button>
          
          {isVoiceMode ? (
            <div 
              onClick={toggleRecording}
              className={`flex-1 text-center py-1.5 rounded-full text-sm font-serif tracking-wide cursor-pointer transition-colors ${
                isRecording ? 'bg-red-50 text-red-500 animate-pulse' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {isRecording ? '正在倾听 (点击停止)...' : '点击 说话'}
            </div>
          ) : (
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="和小花仙说点什么..."
              className="flex-1 bg-transparent px-2 py-1 outline-none text-slate-800 text-sm placeholder:text-slate-400 font-serif"
            />
          )}

          {!isVoiceMode && (
            <button 
              onClick={() => handleSend()}
              className="w-8 h-8 rounded-full bg-emerald-500 text-white shadow-sm flex items-center justify-center shrink-0 transition-transform hover:scale-105"
            >
              <Send size={14} className="mr-0.5" />
            </button>
          )}
          {isVoiceMode && isRecording && (
            <button 
              onClick={toggleRecording}
              className="w-8 h-8 rounded-full bg-red-400 text-white shadow-sm flex items-center justify-center shrink-0 transition-transform hover:scale-105 animate-pulse"
            >
              <Square size={12} fill="white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
