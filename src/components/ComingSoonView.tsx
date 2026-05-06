import { Hammer } from 'lucide-react';

export default function ComingSoonView({ title }: { title: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50/50 p-6 min-h-[500px]">
      <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 text-blue-500 animate-[pulse_3s_ease-in-out_infinite] shadow-sm">
        <Hammer size={36} />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-3">{title}</h2>
      <p className="text-gray-500 text-center max-w-sm leading-relaxed">
        这个模块正在紧锣密鼓地开发中，<br/>敬请期待功能上线！
      </p>
    </div>
  );
}
