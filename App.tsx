import React, { useState, useEffect } from 'react';
import { ViewState } from './types';
import { getStoredUser, setStoredUser, logoutStoredUser } from './services/storageService';
import { Navigation } from './components/Navigation';
import { LoginPage } from './pages/LoginPage';
import { EventListPage } from './pages/EventListPage';
import { CreateEventPage } from './pages/CreateEventPage';
import { EventDetailPage } from './pages/EventDetailPage';

const App: React.FC = () => {
  const [userName, setUserName] = useState<string | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.LOGIN);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUserName(stored);
      setView(ViewState.LIST);
    }
  }, []);

  const handleLogin = (name: string) => {
    setStoredUser(name);
    setUserName(name);
    setView(ViewState.LIST);
  };

  const handleLogout = () => {
    logoutStoredUser();
    setUserName(null);
    setView(ViewState.LOGIN);
  };

  const handleEventSelect = (id: string) => {
    setSelectedEventId(id);
    setView(ViewState.DETAIL);
  };

  const handleNavigate = (target: ViewState) => {
      setView(target);
      if (target !== ViewState.DETAIL) {
          setSelectedEventId(null);
      }
  };

  if (!userName || view === ViewState.LOGIN) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-background font-sans text-slate-800">
      <Navigation 
        userName={userName} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout}
        currentView={view}
      />

      <main>
        {view === ViewState.LIST && (
          <EventListPage 
            onSelectEvent={handleEventSelect} 
            onNavigate={handleNavigate}
          />
        )}

        {view === ViewState.CREATE && (
          <CreateEventPage 
            userName={userName} 
            onNavigate={handleNavigate}
          />
        )}

        {view === ViewState.DETAIL && selectedEventId && (
          <EventDetailPage 
            eventId={selectedEventId} 
            userName={userName}
            onBack={() => handleNavigate(ViewState.LIST)}
          />
        )}
      </main>
    </div>
  );
};

export default App;
