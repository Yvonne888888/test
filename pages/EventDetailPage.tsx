import React, { useState, useEffect } from 'react';
import { ViewState, EventData, RSVP, Comment, Photo } from '../types';
import { getEventById, updateEvent, getRSVPs, addRSVP, removeRSVP, checkInUser, getComments, addComment, getPhotos, addPhoto } from '../services/storageService';
import { Button } from '../components/Button';

interface EventDetailPageProps {
  eventId: string;
  userName: string;
  onBack: () => void;
}

type Tab = 'info' | 'rsvp' | 'gallery' | 'chat';

export const EventDetailPage: React.FC<EventDetailPageProps> = ({ eventId, userName, onBack }) => {
  const [event, setEvent] = useState<EventData | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<Tab>('info');
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  // Forms
  const [fullName, setFullName] = useState(userName);
  const [newComment, setNewComment] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);

  // Organizer edit forms
  const [editCost, setEditCost] = useState<string>('');

  useEffect(() => {
    const data = getEventById(eventId);
    setEvent(data);
    if (data) {
      setEditCost(data.cost.toString());
      refreshData();
    }
    const timer = setInterval(() => setCurrentTime(Date.now()), 60000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const refreshData = () => {
    setRsvps(getRSVPs(eventId));
    setComments(getComments(eventId));
    setPhotos(getPhotos(eventId));
    // Refresh event data as it might change by organizer
    const freshEvent = getEventById(eventId);
    if (freshEvent) setEvent(freshEvent);
  };

  const userRSVP = rsvps.find(r => r.userName === userName);

  const getEventStatus = () => {
    if (!event) return { isEnded: false, checkInOpen: false };
    const start = new Date(`${event.date}T${event.time}`).getTime();
    const checkInStart = start - (30 * 60 * 1000);
    
    // Logic: Ended = Date + 2 days (end of that day)
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate);
    endDate.setDate(endDate.getDate() + 2);
    endDate.setHours(23, 59, 59, 999);
    
    const isEnded = currentTime > endDate.getTime();
    const checkInOpen = currentTime >= checkInStart;
    
    return { isEnded, checkInOpen };
  };

  const { isEnded, checkInOpen } = getEventStatus();
  const isOrganizer = event?.organizer === userName;

  const handleJoin = () => {
    if (isEnded) return;
    if (!fullName.trim()) {
        alert("请填写您的全名");
        return;
    }
    const rsvp: RSVP = {
        id: crypto.randomUUID(),
        eventId,
        userName,
        contact: fullName, 
        status: 'pending', 
        timestamp: Date.now()
    };
    addRSVP(rsvp);
    refreshData();
    alert("报名成功！请在活动现场签到并支付费用。");
  };

  const handleCancelRSVP = () => {
      if (window.confirm("确定要取消报名吗？")) {
          removeRSVP(eventId, userName);
          refreshData();
      }
  };

  const handleCheckIn = () => {
    checkInUser(eventId, userName);
    refreshData();
    setShowPayModal(true);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newComment.trim()) return;
    
    addComment({
        id: crypto.randomUUID(),
        eventId,
        userName,
        content: newComment,
        timestamp: Date.now()
    });
    setNewComment('');
    refreshData();
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            addPhoto({
                id: crypto.randomUUID(),
                eventId,
                userName,
                url: reader.result as string,
                timestamp: Date.now()
            });
            refreshData();
        };
        reader.readAsDataURL(file);
    }
  };

  const handleOrganizerUpdateCost = () => {
      if (!event) return;
      const newCost = Number(editCost);
      const updated = { ...event, cost: newCost };
      updateEvent(updated);
      refreshData();
      alert('人均费用已更新');
  };

  const handleOrganizerUpdateQR = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && event) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const updated = { ...event, paymentQRCode: reader.result as string };
            updateEvent(updated);
            refreshData();
            alert('付款码已更新');
        };
        reader.readAsDataURL(file);
      }
  };

  if (!event) return <div>Loading...</div>;

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Hero Image */}
      <div className="relative h-56 md:h-72 w-full">
        <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover filter brightness-75" />
        <div className="absolute top-4 left-4 z-10">
            <button onClick={onBack} className="bg-black/50 text-white p-2 rounded-full backdrop-blur hover:bg-black/70">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
             {isEnded && <span className="inline-block bg-slate-600 text-xs px-2 py-1 rounded mb-2">已结束</span>}
            <h1 className="text-2xl font-bold">{event.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm opacity-90">
                <span>📅 {event.date} {event.time}</span>
                <span>📍 {event.location}</span>
            </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-14 z-40 bg-white shadow-sm border-b border-slate-200 px-4 flex justify-between text-sm font-medium text-slate-500">
        {['info', 'rsvp', 'gallery', 'chat'].map((tab) => (
            <button
                key={tab}
                onClick={() => setActiveTab(tab as Tab)}
                className={`py-3 px-2 border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent hover:text-slate-700'}`}
            >
                {tab === 'info' && '详情'}
                {tab === 'rsvp' && `报名 (${rsvps.length})`}
                {tab === 'gallery' && '照片墙'}
                {tab === 'chat' && '留言'}
            </button>
        ))}
      </div>

      <div className="max-w-3xl mx-auto p-4">
        
        {/* INFO TAB */}
        {activeTab === 'info' && (
            <div className="space-y-6">
                
                {/* Organizer Admin Panel */}
                {isOrganizer && (
                    <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                        <h3 className="font-bold text-indigo-800 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            组织者管理 (仅你可见)
                        </h3>
                        <p className="text-xs text-indigo-600 mb-4">活动结束后，请在此更新最终人均费用并上传收款码。</p>
                        
                        <div className="grid gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-indigo-700 mb-1">更新收款码</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-16 h-16 bg-white border border-indigo-200 rounded flex items-center justify-center overflow-hidden">
                                        {event.paymentQRCode ? (
                                            <img src={event.paymentQRCode} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-gray-400">无</span>
                                        )}
                                        <input type="file" onChange={handleOrganizerUpdateQR} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                    <div className="text-xs text-indigo-600">点击左侧图片更换</div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-indigo-700 mb-1">更新人均费用 (元)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="number" 
                                        value={editCost} 
                                        onChange={e => setEditCost(e.target.value)}
                                        className="w-24 px-2 py-1 text-sm border border-indigo-200 rounded"
                                    />
                                    <button onClick={handleOrganizerUpdateCost} className="bg-indigo-600 text-white px-3 py-1 rounded text-xs">保存费用</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="bg-white p-5 rounded-xl shadow-sm">
                    <h3 className="font-bold text-slate-900 mb-3 text-lg">活动简介</h3>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
                
                <div className="bg-white p-5 rounded-xl shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-slate-500">💰 人均费用</span>
                        <span className="font-bold text-primary text-lg">¥ {event.cost}</span>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                        <span className="text-slate-500">👤 发起人</span>
                        <span className="font-medium">{event.organizer}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">📍 详细地址</span>
                        <span className="font-medium">{event.location}</span>
                    </div>
                </div>

                {/* Registration / Check-in Area */}
                {!userRSVP ? (
                    isEnded ? (
                         <div className="bg-slate-100 p-5 rounded-xl text-center text-slate-500">
                             活动已结束，停止报名
                         </div>
                    ) : (
                        <div className="bg-white p-5 rounded-xl shadow-sm border-l-4 border-primary">
                            <h3 className="font-bold text-lg mb-2">👋 还没报名吗？</h3>
                            <p className="text-slate-500 text-sm mb-4">无需预付费，确认全名即可加入。</p>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    placeholder="请输入您的全名" 
                                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary"
                                    value={fullName}
                                    onChange={e => setFullName(e.target.value)}
                                />
                                <Button onClick={handleJoin}>立即报名</Button>
                            </div>
                        </div>
                    )
                ) : (
                    <div className="bg-green-50 p-5 rounded-xl border border-green-200 text-center relative">
                        <div className="text-green-600 font-bold text-lg mb-1">✓ 已报名成功</div>
                        
                        {/* Check-in Logic */}
                        <div className="mt-4 py-2">
                            {!userRSVP.checkInTime ? (
                                <div className="space-y-2">
                                    <Button 
                                        size="lg" 
                                        onClick={handleCheckIn} 
                                        // Allow check-in if open OR event is ended (settlement phase)
                                        disabled={!checkInOpen && !isEnded}
                                        className={`w-full shadow-md transition-all ${(!checkInOpen && !isEnded) ? 'bg-slate-300 cursor-not-allowed opacity-70' : 'animate-pulse'}`}
                                    >
                                        {(checkInOpen || isEnded) ? '📍 点击签到' : `签到未开放`}
                                    </Button>
                                    {(!checkInOpen && !isEnded) && (
                                        <p className="text-xs text-slate-500">
                                            活动开始前30分钟开放签到
                                        </p>
                                    )}
                                     {/* If event is ended and user hasn't checked in, prompt them to check in to pay */}
                                     {isEnded && (
                                        <p className="text-xs text-orange-600 font-medium mt-2">
                                            活动已结束，请签到并支付分摊费用。
                                        </p>
                                     )}
                                </div>
                            ) : (
                                <div>
                                    <span className="text-sm text-slate-500 block mb-3">
                                        已于 {new Date(userRSVP.checkInTime).toLocaleTimeString()} 签到
                                    </span>
                                    <Button size="sm" variant="outline" onClick={() => setShowPayModal(true)}>查看收款码</Button>
                                </div>
                            )}
                        </div>

                        {/* Cancel Option - Only if not ended and not checked in */}
                        {!isEnded && !userRSVP.checkInTime && (
                            <button 
                                onClick={handleCancelRSVP}
                                className="absolute top-4 right-4 text-xs text-red-400 hover:text-red-600 hover:underline"
                            >
                                取消报名
                            </button>
                        )}
                    </div>
                )}
            </div>
        )}

        {/* RSVP TAB */}
        {activeTab === 'rsvp' && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                {rsvps.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">还没人报名，快抢沙发！</div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-600">
                            <tr>
                                <th className="px-4 py-3">姓名</th>
                                <th className="px-4 py-3">状态</th>
                                <th className="px-4 py-3 text-right">签到</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {rsvps.map(r => (
                                <tr key={r.id}>
                                    <td className="px-4 py-3 font-medium">{r.contact || r.userName}</td>
                                    <td className="px-4 py-3">
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">已报名</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-slate-400">
                                        {r.checkInTime ? '✅' : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === 'gallery' && (
            <div>
                 <div className="mb-4 flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">活动相册</h3>
                    {userRSVP && (
                        <div>
                            <input type="file" accept="image/*" id="upload-photo" className="hidden" onChange={handlePhotoUpload} />
                            <label htmlFor="upload-photo" className="bg-primary text-white px-3 py-1.5 rounded-lg text-sm cursor-pointer hover:bg-indigo-700 flex items-center gap-1 shadow-sm active:scale-95 transition-transform">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                上传照片
                            </label>
                        </div>
                    )}
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {photos.length === 0 ? (
                        <div className="col-span-full py-10 text-center text-slate-400 bg-white rounded-xl border border-dashed">
                            暂无照片，参与者可上传
                        </div>
                    ) : (
                        photos.map(p => (
                            <div key={p.id} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm">
                                <img src={p.url} alt="Event" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity truncate">
                                    by {p.userName}
                                </div>
                            </div>
                        ))
                    )}
                 </div>
            </div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
            <div className="space-y-4">
                 {/* Comment List */}
                 <div className="space-y-3">
                    {comments.map(c => (
                        <div key={c.id} className="bg-white p-3 rounded-xl shadow-sm flex gap-3">
                            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {c.userName[0]}
                            </div>
                            <div>
                                <div className="flex items-baseline gap-2">
                                    <span className="font-bold text-sm text-slate-800">{c.userName}</span>
                                    <span className="text-xs text-slate-400">{new Date(c.timestamp).toLocaleDateString()}</span>
                                </div>
                                <p className="text-slate-600 text-sm mt-1">{c.content}</p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <div className="text-center py-8 text-slate-400">暂无留言，说点什么吧~</div>
                    )}
                 </div>

                 {/* Comment Input */}
                 {userRSVP && (
                    <form onSubmit={handleCommentSubmit} className="bg-white p-3 rounded-xl shadow-sm flex gap-2 sticky bottom-4 border border-slate-100">
                        <input 
                            type="text" 
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="发表留言..."
                            className="flex-1 bg-slate-50 border-transparent focus:bg-white focus:border-primary rounded-lg px-3 text-sm outline-none transition-colors"
                        />
                        <Button size="sm" type="submit" disabled={!newComment.trim()}>发送</Button>
                    </form>
                 )}
            </div>
        )}

      </div>

      {/* Payment Modal (Shown after check-in) */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPayModal(false)}>
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl animate-bounce-in" onClick={e => e.stopPropagation()}>
                <h3 className="text-xl font-bold mb-2">活动结算</h3>
                <p className="text-slate-500 mb-4">感谢签到！请扫描下方二维码支付费用</p>
                <div className="w-full aspect-square mx-auto mb-4 flex items-center justify-center rounded-lg border border-slate-100 bg-slate-50 overflow-hidden">
                    {event.paymentQRCode ? (
                        <img src={event.paymentQRCode} alt="Payment QR Code" className="w-full h-full object-contain" />
                    ) : (
                         <div className="text-center p-4">
                             <p className="text-slate-400 text-sm">发起人尚未上传收款码</p>
                             <p className="text-xs text-slate-300 mt-1">请稍后查看或直接联系 {event.organizer}</p>
                         </div>
                    )}
                </div>
                <p className="text-lg font-bold text-primary mb-4">需支付: ¥{event.cost}</p>
                <Button onClick={() => setShowPayModal(false)} className="w-full">我已支付</Button>
            </div>
        </div>
      )}
    </div>
  );
};