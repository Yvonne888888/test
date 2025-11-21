import React from 'react';
import { ViewState } from '../types';

interface NavigationProps {
  userName: string;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
  currentView: ViewState;
}

export const Navigation: React.FC<NavigationProps> = ({ userName, onNavigate, onLogout, currentView }) => {
  return (
    <nav className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <div 
          className="font-bold text-lg cursor-pointer flex items-center gap-2"
          onClick={() => onNavigate(ViewState.LIST)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          班级聚会
        </div>
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline opacity-90">你好, {userName}</span>
          {currentView !== ViewState.LIST && (
             <button onClick={() => onNavigate(ViewState.LIST)} className="hover:text-indigo-200">首页</button>
          )}
          <button onClick={onLogout} className="hover:text-indigo-200 underline">退出</button>
        </div>
      </div>
    </nav>
  );
};
