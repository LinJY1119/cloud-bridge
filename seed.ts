import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, deleteDoc, doc } from 'firebase/firestore';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf-8'));
const app = initializeApp(config);
const db = getFirestore(app);
const DEMO_UID = 'demo_garden';

const seedDiaries = [
  // April
  { dateStr: '2026-04-03', type: '🌹', content: '今天和同学去抓泥鳅，弄得满脸是泥，哈哈哈。' },
  { dateStr: '2026-04-06', type: '🌳', content: '和爷爷学习编竹筐，手被划了一下，但是学到了新本事。' },
  { dateStr: '2026-04-10', type: '🪻', content: '看到别人的爸爸来接他们放学，有点想爸爸了，偷偷哭了一小会儿。' },
  { dateStr: '2026-04-15', type: '🌵', content: '弟弟今天把我的作业本撕坏了，气死我了，我再也不理他了！' },
  { dateStr: '2026-04-20', type: '🌹', content: '收到了妈妈寄来的新衣服，蓝色的，超级漂亮，明天要穿去学校！' },
  { dateStr: '2026-04-24', type: '🌳', content: '下雨了，在屋里画画。画了我们一家人。' },
  { dateStr: '2026-04-28', type: '🪻', content: '家里的老狗生病了，很不舒服，我很担心它。' },
  
  // May
  { dateStr: '2026-05-02', type: '🌹', content: '今天帮奶奶喂了小鸡，很开心！小鸡毛茸茸的。' },
  { dateStr: '2026-05-05', type: '🌳', content: '下雨了，爷爷腿疼，我帮爷爷捶背。希望爸爸早点打工回来。' },
  { dateStr: '2026-05-09', type: '🌵', content: '今天在学校和同桌吵架了，她弄坏了我的橡皮，我很生气。' },
  { dateStr: '2026-05-12', type: '🪻', content: '村里的燕子飞回来了，春天真好看，但是我生病发烧了。' },
  { dateStr: '2026-05-17', type: '🌹', content: '考试考了100分！老师表扬了我，明天周末我想打给妈妈分享！' },
  { dateStr: '2026-05-21', type: '🌵', content: '摔跤了膝盖磕破皮了，好痛，但我没哭。' },
  { dateStr: '2026-05-25', type: '🌳', content: '发现菜园子里的西红柿结果了，绿油油的，好期待它们变红。' },
  { dateStr: '2026-05-30', type: '🌹', content: '快要过儿童节了，老师说要排练节目，我选上了！' }
];

async function seed() {
  try {
    const snap = await getDocs(collection(db, `users/${DEMO_UID}/diaries`));
    console.log(`Found ${snap.docs.length} existing diaries. Deleting...`);
    for (const d of snap.docs) {
      await deleteDoc(doc(db, `users/${DEMO_UID}/diaries`, d.id));
    }
    
    console.log('Inserting new diaries...');
    for (const d of seedDiaries) {
      await addDoc(collection(db, `users/${DEMO_UID}/diaries`), {
        ...d,
        createdAt: serverTimestamp()
      });
    }
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

seed();
