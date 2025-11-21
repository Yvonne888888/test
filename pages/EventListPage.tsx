import React, { useState, useEffect, useMemo } from 'react';
import { EventData, ViewState } from '../types';
import { getEvents } from '../services/storageService';
import { Button } from '../components/Button';

interface EventListPageProps {
  onSelectEvent: (id: string) => void;
  onNavigate: (view: ViewState) => void;
}

export const EventListPage: React.FC<EventListPageProps> = ({ onSelectEvent, onNavigate }) => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'cost'>('date');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    setEvents(getEvents());
    // Update time to keep statuses fresh
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = useMemo(() => {
    let result = events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortBy === 'date') {
      // Sort logic: Upcoming events first (closest to now), then Past events (most recent past first)
      result.sort((a, b) => {
          const timeA = new Date(`${a.date}T${a.time}`).getTime();
          const timeB = new Date(`${b.date}T${b.time}`).getTime();
          return timeA - timeB;
      });
    } else {
      result.sort((a, b) => a.cost - b.cost);
    }
    
    return result;
  }, [events, searchTerm, sortBy]);

  const getEventStatus = (date: string) => {
      // Logic: Ended = Date + 2 days (end of that day)
      const eventDate = new Date(date);
      const endDate = new Date(eventDate);
      endDate.setDate(endDate.getDate() + 2);
      endDate.setHours(23, 59, 59, 999);
      
      const isEnded = now > endDate.getTime();
      return isEnded ? 'ended' : 'active';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="relative w-full sm:w-auto flex-1">
          <input
            type="text"
            placeholder="搜索聚会 (标题/地点)"
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-full focus:ring-2 focus:ring-primary outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
           <select 
             value={sortBy}
             onChange={(e) => setSortBy(e.target.value as 'date' | 'cost')}
             className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none"
           >
             <option value="date">按时间排序</option>
             <option value="cost">按费用排序</option>
           </select>
        </div>
      </div>

      {/* List */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-slate-900">暂无活动</h3>
          <p className="text-slate-500 mb-6">还没有同学发起聚会，来做第一个发起人吧！</p>
          <Button onClick={() => onNavigate(ViewState.CREATE)}>发起新聚会</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map(event => {
            const status = getEventStatus(event.date);
            const isEnded = status === 'ended';

            return (
                <div 
                key={event.id}
                onClick={() => onSelectEvent(event.id)}
                className={`
                    bg-white rounded-xl shadow-sm cursor-pointer overflow-hidden flex flex-col h-full transition-all
                    ${isEnded ? 'grayscale opacity-80 border border-slate-200' : 'hover:shadow-md ring-1 ring-slate-100 hover:ring-primary/50'}
                `}
                >
                <div className="h-40 bg-slate-200 relative">
                    <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold text-primary">
                    ¥ {event.cost}/人
                    </div>
                    
                    {/* Status Badge */}
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold shadow-sm ${isEnded ? 'bg-slate-600 text-white' : 'bg-green-500 text-white'}`}>
                        {isEnded ? '已结束' : '正在进行'}
                    </div>
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                    <h3 className={`text-lg font-bold mb-2 line-clamp-1 ${isEnded ? 'text-slate-500' : 'text-slate-800'}`}>{event.title}</h3>
                    <div className="space-y-1 text-sm text-slate-500 mb-4 flex-1">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <span className={!isEnded ? 'text-green-700 font-medium' : ''}>
                            {event.date} {event.time}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {event.location}
                    </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-xs text-slate-400">发起人: {event.organizer}</span>
                    <span className={`text-sm font-medium ${isEnded ? 'text-slate-400' : 'text-primary'}`}>查看详情 &rarr;</span>
                    </div>
                </div>
                </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => onNavigate(ViewState.CREATE)}
        className="fixed bottom-6 right-6 bg-primary text-white w-14 h-14 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:bg-indigo-600 transition-transform hover:scale-105 z-40"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
};