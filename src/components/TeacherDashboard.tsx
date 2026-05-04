import { useState } from 'react';
import { AlertTriangle, Users, Heart, PhoneForwarded, Search, Bell, ChevronRight } from 'lucide-react';
import LiquidGlassBackground from './LiquidGlassBackground';

export default function TeacherDashboard() {
  const [activeTab, setActiveTab] = useState('cloud'); // cloud, alerts

  return (
    <div className="relative w-full h-full flex font-sans overflow-hidden bg-blue-50 text-slate-800 selection:bg-blue-200 selection:text-blue-900">
      <LiquidGlassBackground />
      {/* Sidebar */}
      <div className="w-64 bg-white/40 backdrop-blur-xl border-r border-white/50 p-6 flex flex-col gap-8 z-10">
        <div className="flex items-center gap-3 text-blue-600 font-serif font-normal text-2xl tracking-tight">
          <Heart fill="currentColor" strokeWidth={1} />
          <span>云桥校园端</span>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('cloud')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-serif tracking-wide border ${activeTab === 'cloud' ? 'bg-blue-500 text-white border-transparent shadow-md' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50 border-transparent'}`}
          >
            <Users size={20} />
            班级情绪云图
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-serif tracking-wide border ${activeTab === 'alerts' ? 'bg-[#FF6B6B] text-white border-transparent shadow-md' : 'text-slate-500 hover:bg-white/50 border-transparent'}`}
          >
            <AlertTriangle size={20} />
            预警中心
            <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'alerts' ? 'bg-white text-[#FF6B6B]' : 'bg-[#FF6B6B] text-white'}`}>3</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-10 overflow-y-auto z-10">
        {activeTab === 'cloud' ? (
          <>
            <h1 className="text-4xl font-normal font-serif text-slate-800 mb-8 tracking-tight">三年二班 - 今日情绪气象局</h1>
            
            <div className="grid grid-cols-3 gap-8 mb-8">
              {/* Chart Card */}
              <div className="col-span-2 bg-white/60 backdrop-blur-md p-8 rounded-[2rem] shadow-sm border border-white/50 flex items-center gap-12">
                <div className="w-48 h-48 rounded-full border-[16px] border-white/50 relative flex items-center justify-center">
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'conic-gradient(#FFD166 0% 60%, #06D6A0 60% 90%, #FF6B6B 90% 100%)' }}
                  />
                  <div className="absolute inset-4 bg-white/80 backdrop-blur-sm rounded-full flex flex-col items-center justify-center border border-white/50">
                    <span className="text-4xl font-serif text-slate-800">42</span>
                    <span className="text-xs text-slate-500 uppercase tracking-wider mt-1">今日记录</span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4 flex-1">
                  <div className="flex justify-between items-center cursor-pointer hover:bg-white/80 p-3 rounded-xl transition-all border border-transparent hover:border-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#FFD166] shadow-sm" />
                      <span className="text-slate-500 font-serif tracking-wide">向日葵 (开心)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-slate-800 text-lg">60%</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center cursor-pointer hover:bg-white/80 p-3 rounded-xl transition-all border border-transparent hover:border-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#06D6A0] shadow-sm" />
                      <span className="text-slate-500 font-serif tracking-wide">薄荷草 (平静)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-slate-800 text-lg">30%</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center cursor-pointer hover:bg-white/80 p-3 rounded-xl transition-all border border-transparent hover:border-white/50">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-[#FF6B6B] shadow-sm" />
                      <span className="text-slate-500 font-serif tracking-wide">仙人掌 (愤怒)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-serif text-slate-800 text-lg">10%</span>
                      <ChevronRight size={16} className="text-slate-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-8 rounded-[2rem] text-white shadow-lg flex flex-col justify-between border border-blue-400/30">
                <div>
                  <h3 className="text-blue-100 font-serif tracking-wide mb-2 uppercase text-xs">需关注学生</h3>
                  <div className="text-6xl font-serif tracking-tight">3<span className="text-2xl font-sans text-blue-100 ml-2">人</span></div>
                </div>
                <button 
                  onClick={() => setActiveTab('alerts')}
                  className="w-full py-3 bg-white/10 hover:bg-white/20 transition-colors rounded-xl font-serif tracking-wide backdrop-blur-sm border border-white/10"
                >
                  查看详情
                </button>
              </div>
            </div>

            {/* Alerts List Preview */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-slate-800 flex items-center gap-3 tracking-tight">
                <AlertTriangle className="text-[#FF6B6B]" />
                重点关注名单 <span className="text-sm font-sans tracking-wide text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded-full bg-white/50">(AI 风险预警)</span>
              </h2>
              <button onClick={() => setActiveTab('alerts')} className="text-blue-600 font-serif tracking-wide text-sm hover:underline hover:text-blue-800">
                查看全部
              </button>
            </div>
            
            <div className="bg-white/60 backdrop-blur-md rounded-[2rem] shadow-sm border border-white/50 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('alerts')}>
              <div className="p-6 border-b border-white/50 flex items-start justify-between bg-[#FF6B6B]/10">
                <div className="flex gap-6">
                  <div className="w-14 h-14 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center font-serif text-2xl shadow-sm">
                    雨
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-serif text-2xl text-slate-800">小雨</h3>
                      <span className="px-3 py-1 bg-[#FF6B6B] text-white rounded-full text-xs font-bold tracking-wide shadow-sm flex items-center gap-1">风险等级：高</span>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <span className="px-3 py-1 bg-white/80 border border-white/50 text-slate-500 rounded-md text-xs font-serif tracking-wide shadow-sm"># 校园欺凌</span>
                      <span className="px-3 py-1 bg-white/80 border border-white/50 text-slate-500 rounded-md text-xs font-serif tracking-wide shadow-sm"># 极度孤独</span>
                    </div>
                    <p className="text-sm text-slate-700">
                      <span className="font-serif font-bold text-slate-800 border-b border-slate-300">AI 建议</span>：立即进行线下干预并联系家长。
                    </p>
                  </div>
                </div>
                <button className="flex items-center gap-2 px-5 py-3 bg-[#FF6B6B] hover:bg-[#FF6B6B]/90 transition-transform hover:scale-105 text-white rounded-xl text-sm font-serif tracking-wide shadow-md">
                  <PhoneForwarded size={16} />
                  一键转交公益心理咨询师
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-serif tracking-tight text-slate-800">预警中心</h1>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" placeholder="搜索学生姓名..." className="pl-10 pr-4 py-2 rounded-full border border-white/50 bg-white/60 backdrop-blur-md outline-none focus:border-blue-300 text-slate-800 font-serif shadow-sm placeholder:text-slate-400" />
                </div>
                <button className="px-4 py-2 bg-white/60 backdrop-blur-md border border-white/50 rounded-full text-sm font-serif tracking-wide text-slate-700 hover:bg-white transition-colors flex items-center gap-2 shadow-sm">
                  <Bell size={16} /> 预警设置
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              {/* High Risk */}
              <div className="bg-white/60 backdrop-blur-md rounded-[1.5rem] shadow-sm border border-white/50 overflow-hidden cursor-pointer hover:shadow-md transition-all">
                <div className="p-6 flex items-start justify-between bg-[#FF6B6B]/10">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 bg-[#FF6B6B] text-white rounded-full flex items-center justify-center font-serif text-xl shadow-sm">雨</div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif text-xl text-slate-800">小雨</h3>
                        <span className="px-2 py-0.5 bg-[#FF6B6B] text-white rounded-full text-[10px] font-bold tracking-wide shadow-sm">高风险</span>
                        <span className="text-xs text-slate-500 ml-2 font-serif tracking-wide">10分钟前</span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-sm font-serif text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded bg-white/50">触发词: "打我", "害怕"</span>
                      </div>
                      <p className="text-sm text-slate-700 font-sans">在虚拟伙伴通话中提及被欺凌，情绪极度不稳定。</p>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-[#FF6B6B] text-white rounded-xl text-sm font-serif tracking-wide shadow-sm hover:scale-105 transition-transform">
                    立即处理
                  </button>
                </div>
              </div>

              {/* Medium Risk */}
              <div className="bg-white/60 backdrop-blur-md rounded-[1.5rem] shadow-sm border border-white/50 overflow-hidden cursor-pointer hover:shadow-md transition-all">
                <div className="p-6 flex items-start justify-between bg-[#FFD166]/10">
                  <div className="flex gap-5">
                    <div className="w-12 h-12 bg-[#FFD166] text-black rounded-full flex items-center justify-center font-serif text-xl shadow-sm">明</div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-serif text-xl text-slate-800">李明</h3>
                        <span className="px-2 py-0.5 bg-[#FFD166] text-black rounded-full text-[10px] font-bold tracking-wide shadow-sm">中风险</span>
                        <span className="text-xs text-slate-500 ml-2 font-serif tracking-wide">2小时前</span>
                      </div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-sm font-serif text-slate-500 border border-slate-200/50 px-2 py-0.5 rounded bg-white/50">连续3天种出仙人掌</span>
                      </div>
                      <p className="text-sm text-slate-700 font-sans">情绪持续低落/愤怒，建议班主任介入谈话。</p>
                    </div>
                  </div>
                  <button className="px-5 py-2.5 bg-white/80 border border-white/50 text-slate-700 rounded-xl text-sm font-serif tracking-wide shadow-sm hover:bg-white transition-colors">
                    查看详情
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
