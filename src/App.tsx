import React, { useState, useEffect } from 'react';
import ChildHome from './components/ChildHome';
import ChildGarden from './components/ChildGarden';
import ChildCall from './components/ChildCall';
import ChildMessage from './components/ChildMessage';
import ParentApp from './components/ParentApp';
import TeacherDashboard from './components/TeacherDashboard';
import ComingSoonView from './components/ComingSoonView';
import LandingHero from './components/LandingHero';
import { Monitor, User, Users, Phone, Trash2, AlertTriangle } from 'lucide-react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, limit, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function App() {
  const [view, setView] = useState('landing'); // landing, child-home, child-garden, child-call, child-message, parent, teacher
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  
  // Shared State
  const [diaries, setDiaries] = useState<any[]>([]);
  const [parentAction, setParentAction] = useState<{type: 'water' | 'heart', id: number} | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  // Hardcoded demo user ID for the judges
  const DEMO_UID = 'demo_garden';

  useEffect(() => {
    // Clear messages on initial load for a fresh demo experience
    const clearMessages = async () => {
      try {
        const snap = await getDocs(collection(db, `users/${DEMO_UID}/messages`));
        const deletes = snap.docs.map(d => deleteDoc(doc(db, `users/${DEMO_UID}/messages`, d.id)));
        await Promise.all(deletes);
      } catch (error) {
        console.error("Error clearing messages on load:", error);
      }
    };
    clearMessages();
  }, []);

  useEffect(() => {
    const diariesRef = collection(db, `users/${DEMO_UID}/diaries`);
    const qDiaries = query(diariesRef, orderBy('createdAt', 'asc'));
    
    const unsubDiaries = onSnapshot(qDiaries, async (snapshot) => {
      const loadedDiaries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (loadedDiaries.length === 0) {
        // Seed database
        const seedData = [
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
        // Only seed once to avoid spamming if there's a delay
        if (!window.sessionStorage.getItem('seeded')) {
          window.sessionStorage.setItem('seeded', 'true');
          console.log('Seeding initial diaries...');
          for (const d of seedData) {
            try {
              await addDoc(diariesRef, {
                ...d,
                createdAt: serverTimestamp()
              });
            } catch (e) {
              console.error("Failed to seed diary", e);
            }
          }
        }
      }
      
      setDiaries(loadedDiaries);
    }, (error) => {
      console.error("Error fetching diaries:", error);
    });

    const actionsRef = collection(db, `users/${DEMO_UID}/actions`);
    const qActions = query(actionsRef, orderBy('createdAt', 'desc'), limit(1));
    
    const unsubActions = onSnapshot(qActions, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Only trigger if it's a recent action (within last 10 seconds)
          if (data.createdAt && (Date.now() - data.createdAt.toMillis() < 10000)) {
            setParentAction({ type: data.type, id: Date.now() });
          }
        }
      });
    }, (error) => {
      console.error("Error fetching actions:", error);
    });

    const messagesRef = collection(db, `users/${DEMO_UID}/messages`);
    const qMessages = query(messagesRef, orderBy('createdAt', 'asc'));
    
    const unsubMessages = onSnapshot(qMessages, (snapshot) => {
      const loadedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(loadedMessages);
    }, (error) => {
      console.error("Error fetching messages:", error);
    });

    return () => {
      unsubDiaries();
      unsubActions();
      unsubMessages();
    };
  }, []);

  const handleAddDiary = async (newDiary: any) => {
    try {
      await addDoc(collection(db, `users/${DEMO_UID}/diaries`), {
        ...newDiary,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding diary:", error);
    }
  };

  const handleParentAction = async (type: 'water' | 'heart') => {
    try {
      await addDoc(collection(db, `users/${DEMO_UID}/actions`), {
        type,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error adding action:", error);
    }
  };

  const handleSendMessage = async (text: string, isParent: boolean) => {
    try {
      await addDoc(collection(db, `users/${DEMO_UID}/messages`), {
        text,
        isParent,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleResetDemo = async () => {
    setIsResetting(true);
    try {
      const diariesSnap = await getDocs(collection(db, `users/${DEMO_UID}/diaries`));
      const diaryDeletes = diariesSnap.docs.map(d => deleteDoc(doc(db, `users/${DEMO_UID}/diaries`, d.id)));
      
      const actionsSnap = await getDocs(collection(db, `users/${DEMO_UID}/actions`));
      const actionDeletes = actionsSnap.docs.map(d => deleteDoc(doc(db, `users/${DEMO_UID}/actions`, d.id)));
      
      const messagesSnap = await getDocs(collection(db, `users/${DEMO_UID}/messages`));
      const messageDeletes = messagesSnap.docs.map(d => deleteDoc(doc(db, `users/${DEMO_UID}/messages`, d.id)));
      
      await Promise.all([...diaryDeletes, ...actionDeletes, ...messageDeletes]);
      setShowResetConfirm(false);
    } catch (error) {
      console.error("Error resetting data:", error);
    } finally {
      setIsResetting(false);
    }
  };

  const renderView = () => {
    switch(view) {
      case 'child-home': return <ChildHome onNavigate={setView} />;
      case 'child-garden': return <ChildGarden diaries={diaries} onAddDiary={handleAddDiary} parentAction={parentAction} onBack={() => setView('child-home')} />;
      case 'child-call': return <ChildCall onBack={() => setView('child-home')} />;
      case 'child-message': return <ChildMessage onBack={() => setView('child-home')} messages={messages} onSendMessage={handleSendMessage} />;
      case 'parent': return <ParentApp diaries={diaries} onAction={handleParentAction} messages={messages} onSendMessage={handleSendMessage} />;
      case 'teacher': return <TeacherDashboard />;
      case 'counselor': return <ComingSoonView title="心理咨询师端" />;
      case 'volunteer': return <ComingSoonView title="志愿者端" />;
      default: return <ChildHome onNavigate={setView} />;
    }
  };

  const isMobileView = view !== 'teacher' && view !== 'counselor' && view !== 'volunteer';

  if (view === 'landing') {
    return <LandingHero onEnter={() => setView('child-home')} onNavigate={setView} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      {/* Demo Navigation - Only showed reset button now as switching is on Landing Page */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex gap-2 z-50 border border-gray-200">
        <button onClick={() => setView('landing')} className="whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          首页
        </button>
        <button onClick={() => setView('child-home')} className="whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          学生端
        </button>
        <button onClick={() => setView('parent')} className="whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          家长端
        </button>
        <button onClick={() => setView('teacher')} className="whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          教师端
        </button>
        <button onClick={() => setView('counselor')} className="whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          咨询师端
        </button>
        <button onClick={() => setView('volunteer')} className="whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors">
          志愿者端
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1 self-center shrink-0"></div>
        <button onClick={() => setShowResetConfirm(true)} className="whitespace-nowrap shrink-0 px-4 py-2 rounded-full text-sm font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2">
          <Trash2 size={16} className="shrink-0" /> 重置数据
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="text-red-500" size={24} />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-800 mb-2">清空演示数据？</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">
              这将会删除当前所有的日记、植物和互动记录，让应用恢复到初始状态。此操作不可恢复。
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowResetConfirm(false)}
                disabled={isResetting}
                className="flex-1 py-3 rounded-xl font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                取消
              </button>
              <button 
                onClick={handleResetDemo}
                disabled={isResetting}
                className="flex-1 py-3 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                {isResetting ? '清理中...' : '确认清空'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Device Frame */}
      <div className={`transition-all duration-500 ease-in-out ${isMobileView ? 'w-[375px] h-[812px] rounded-[3rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden relative bg-white' : 'w-full max-w-6xl h-[800px] rounded-3xl shadow-2xl overflow-hidden bg-white border border-gray-200'}`}>
        {renderView()}
      </div>
    </div>
  );
}
