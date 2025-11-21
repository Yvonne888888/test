import React, { useState, useEffect } from 'react';
import { ViewState, EventData } from '../types';
import { Button } from '../components/Button';
import { saveEvent } from '../services/storageService';
import { generateEventDescription, generateEventSuggestions } from '../services/geminiService';

interface CreateEventPageProps {
  userName: string;
  onNavigate: (view: ViewState) => void;
}

export const CreateEventPage: React.FC<CreateEventPageProps> = ({ userName, onNavigate }) => {
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const [form, setForm] = useState<Partial<EventData>>({
    title: '',
    date: '',
    time: '',
    location: '',
    cost: 0,
    description: '',
    coverImage: '', 
    paymentQRCode: '',
  });

  // Preload generic random covers
  const coverOptions = [
    'https://picsum.photos/800/400?random=1',
    'https://picsum.photos/800/400?random=2',
    'https://picsum.photos/800/400?random=3',
    'https://picsum.photos/800/400?random=4'
  ];

  useEffect(() => {
      // Load suggestions on mount
      generateEventSuggestions().then(setSuggestions);
  }, []);

  const handleAiHelp = async () => {
    if (!form.title || !form.location) {
      alert("请先填写【活动标题】和【地点】，AI 才能帮你写文案哦！");
      return;
    }
    setAiLoading(true);
    const desc = await generateEventDescription(form.title, form.location);
    setForm(prev => ({ ...prev, description: desc }));
    setAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.location) {
        alert("请填写完整信息");
        return;
    }

    const newEvent: EventData = {
      id: crypto.randomUUID(),
      title: form.title!,
      date: form.date!,
      time: form.time || '12:00',
      location: form.location!,
      cost: Number(form.cost) || 0,
      description: form.description || '暂无简介',
      coverImage: form.coverImage || coverOptions[0],
      paymentQRCode: form.paymentQRCode,
      organizer: userName,
      timestamp: Date.now(),
    };

    saveEvent(newEvent);
    onNavigate(ViewState.LIST);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'coverImage' | 'paymentQRCode') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => onNavigate(ViewState.LIST)} className="text-slate-500">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <h2 className="text-xl font-bold text-slate-900">发起新聚会</h2>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm space-y-6">
        
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">活动主题</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={e => setForm({...form, title: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            placeholder="例如：十周年班级聚餐"
          />
           {suggestions.length > 0 && (
             <div className="mt-2 flex flex-wrap gap-2">
               {suggestions.map(s => (
                 <span key={s} onClick={() => setForm(f => ({...f, title: s}))} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full cursor-pointer hover:bg-indigo-100">
                   {s}
                 </span>
               ))}
             </div>
           )}
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">日期</label>
            <input
                type="date"
                required
                value={form.date}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
           </div>
           <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">时间</label>
            <input
                type="time"
                required
                value={form.time}
                onChange={e => setForm({...form, time: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">地点</label>
            <input
                type="text"
                required
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="如：印象江南餐厅"
            />
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">人均预算 (元)</label>
            <input
                type="number"
                min="0"
                value={form.cost}
                onChange={e => setForm({...form, cost: Number(e.target.value)})}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Description with Gemini */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block text-sm font-medium text-slate-700">活动详情/简介</label>
            <button 
              type="button"
              onClick={handleAiHelp}
              disabled={aiLoading}
              className="text-xs flex items-center gap-1 text-primary hover:text-indigo-700 disabled:opacity-50"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L1 21h22L12 2zm0 3.99L18.53 19H5.47L12 5.99z"/></svg>
              {aiLoading ? 'AI 正在撰写...' : 'AI 帮我写'}
            </button>
          </div>
          <textarea
            rows={4}
            value={form.description}
            onChange={e => setForm({...form, description: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            placeholder="介绍一下活动流程和注意事项..."
          />
        </div>

        {/* Payment Code Upload */}
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <label className="block text-sm font-medium text-slate-700 mb-2">我的收款码 (可选)</label>
             <p className="text-xs text-slate-500 mb-3">上传微信/支付宝收款码。参与者只有在【签到成功】后才能看到，用于活动后结算。</p>
             
             <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 bg-white border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center overflow-hidden hover:border-primary cursor-pointer">
                    {form.paymentQRCode ? (
                        <img src={form.paymentQRCode} alt="QR" className="w-full h-full object-cover" />
                    ) : (
                        <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    )}
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'paymentQRCode')} className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
                <div className="text-xs text-slate-400">
                    {form.paymentQRCode ? '已上传' : '点击上传收款码图片'}
                </div>
             </div>
        </div>

        {/* Image Selection */}
        <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">活动封面</label>
            <div className="grid grid-cols-4 gap-2 mb-3">
                {coverOptions.map((src, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => setForm({...form, coverImage: src})}
                        className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 ${form.coverImage === src ? 'border-primary' : 'border-transparent'}`}
                    >
                        <img src={src} alt="option" className="w-full h-full object-cover" />
                    </div>
                ))}
            </div>
            <div className="relative">
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'coverImage')} className="hidden" id="custom-cover" />
                <label htmlFor="custom-cover" className="block w-full text-center py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors">
                    或上传自定义图片
                </label>
            </div>
             {form.coverImage && !coverOptions.includes(form.coverImage!) && (
                <div className="mt-2 rounded-lg overflow-hidden h-32 w-full">
                   <img src={form.coverImage} alt="Preview" className="w-full h-full object-cover" />
                </div>
            )}
        </div>

        <div className="pt-4">
            <Button type="submit" className="w-full" size="lg" loading={loading}>
                立即发布活动
            </Button>
        </div>

      </form>
    </div>
  );
};