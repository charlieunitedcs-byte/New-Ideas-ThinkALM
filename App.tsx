
import React, { useState, createContext, useContext, useEffect } from 'react';
import { HashRouter, Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PhoneCall,
  Bot,
  Library,
  Users,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  BarChart2,
  Cpu,
  Sparkles,
  Info,
  Megaphone,
  Building
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CallAnalysis from './pages/CallAnalysis';
import Roleplay from './pages/Roleplay';
import TrainingLibrary from './pages/TrainingLibrary';
import AdminUsers from './pages/AdminUsers';
import TeamPerformance from './pages/TeamPerformance';
import AIAgentConfig from './pages/AIAgentConfig';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Campaigns from './pages/Campaigns';
import LandingPage from './pages/LandingPage';
import ClientManagement from './pages/ClientManagement';
import Signup from './pages/Signup';
import ClientSignup from './pages/ClientSignup';
import { UserRole, User, SubscriptionPlan } from './types';
import { getCurrentUser, clearUserSession } from './services/authService';

// --- Notification Context ---
interface NotificationContextType {
  notify: (message: string, type?: 'info' | 'success' | 'error') => void;
}

export const NotificationContext = createContext<NotificationContextType>({ notify: () => {} });

// --- Layout Components ---

const SidebarItem = ({ to, icon: Icon, label }: { to: string, icon: any, label: string }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
          isActive 
            ? 'bg-brand-900/40 text-brand-300 border border-brand-500/30 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100'
        }`
      }
    >
      <Icon size={20} className="shrink-0" />
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
};

const Sidebar = ({ isOpen, toggle, onLogout, currentUser }: { isOpen: boolean; toggle: () => void, onLogout: () => void, currentUser: User | null }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggle}
      />
      
      {/* Sidebar Content */}
      <aside 
        className={`fixed top-0 left-0 z-30 h-full w-64 glass-panel border-r border-slate-800/50 transform transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex flex-col h-full bg-slate-950/40">
          <div className="h-24 flex items-center justify-center px-6 border-b border-brand-500/10 bg-gradient-to-br from-slate-900/50 to-slate-950/50">
            <img
              src="/logo.png"
              alt="Think ABC Logo"
              className="h-16 w-auto object-contain"
            />
          </div>

          <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
            <div className="px-4 mb-3 text-[10px] font-bold text-brand-400/80 uppercase tracking-widest">
              Workspace
            </div>
            <SidebarItem to="/" icon={LayoutDashboard} label="Command Center" />
            <SidebarItem to="/calls" icon={PhoneCall} label="Call Intelligence" />
            <SidebarItem to="/roleplay" icon={Sparkles} label="AI Roleplay" />
            <SidebarItem to="/training" icon={Library} label="Training Material" />
            
            <div className="px-4 mt-8 mb-3 text-[10px] font-bold text-brand-400/80 uppercase tracking-widest">
              Manager Tools
            </div>
            <SidebarItem to="/campaigns" icon={Megaphone} label="Campaigns" />
            <SidebarItem to="/team" icon={BarChart2} label="Team Pulse" />
            <SidebarItem to="/ai-agents" icon={Cpu} label="Agent Builder" />

            <div className="px-4 mt-8 mb-3 text-[10px] font-bold text-brand-400/80 uppercase tracking-widest">
              System
            </div>
            {currentUser?.role === UserRole.SUPER_ADMIN && (
              <SidebarItem to="/clients" icon={Building} label="Client Management" />
            )}
            <SidebarItem to="/admin" icon={Users} label="User Access" />
            <SidebarItem to="/settings" icon={SettingsIcon} label="Configuration" />
          </div>

          <div className="p-4 border-t border-slate-800/50">
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:text-red-400 hover:bg-red-950/20 rounded-xl transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              Disconnect
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ onMenuClick, user }: { onMenuClick: () => void, user: any }) => {
  const { notify } = useContext(NotificationContext);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header className="sticky top-0 z-10 glass-panel border-b border-slate-800/50 h-24 px-4 lg:px-8 flex items-center justify-between lg:pl-72 transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 text-slate-400 hover:bg-slate-800 rounded-md"
        >
          <Menu size={24} />
        </button>
        <div className="hidden md:flex items-center relative group">
          <Search className="absolute left-3 text-slate-500 group-focus-within:text-brand-400 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search analysis, calls, users..."
            className="bg-slate-900/50 border border-slate-800/50 text-sm rounded-full pl-10 pr-4 py-2.5 w-72 text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none placeholder:text-slate-600 transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter') notify("Search functionality is simulated in this demo.");
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Gamification Status */}
        <div className="hidden sm:flex flex-col items-end mr-2">
          <div className="flex items-center gap-2 mb-1">
             <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-accent-400">Level 5 Achiever</span>
          </div>
          <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-accent-500 w-[70%] shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
          </div>
        </div>

        <button
          onClick={() => notify("You have 3 unread notifications from the System.")}
          className="p-2.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors relative"
        >
          <Bell size={20} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-accent-500 rounded-full shadow-[0_0_8px_#f97316]"></span>
        </button>
        <div className="flex items-center gap-3 border-l border-slate-800 pl-6 relative">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-200">{user.name}</p>
            <p className="text-xs text-brand-400 font-medium">{user.role}</p>
          </div>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="relative group"
          >
            <img
              src={user.avatarUrl}
              alt="User"
              className="w-10 h-10 rounded-full border-2 border-slate-800 ring-2 ring-brand-900 cursor-pointer hover:ring-brand-600 transition-all"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></div>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute top-full right-0 mt-2 w-64 glass-panel border border-slate-800/50 rounded-xl shadow-2xl z-30 overflow-hidden animate-fade-in">
                <div className="p-4 border-b border-slate-800/50 bg-slate-900/50">
                  <p className="text-sm font-bold text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 mt-1">{user.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      window.location.hash = '#/settings';
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors flex items-center gap-3"
                  >
                    <SettingsIcon size={16} />
                    Account Settings
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

// --- Toast Notification Component ---
const Toast = ({ message, type, onClose }: { message: string, type: string, onClose: () => void }) => (
  <div className="fixed top-24 right-8 z-50 animate-fade-in">
    <div className={`bg-slate-900/95 backdrop-blur border border-slate-700 p-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px] ${
       type === 'success' ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-brand-500'
    }`}>
      <div className={`p-1.5 rounded-full ${type === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-brand-500/20 text-brand-400'}`}>
         {type === 'success' ? <Sparkles size={16} /> : <Info size={16} />}
      </div>
      <p className="text-sm text-slate-200 font-medium">{message}</p>
      <button onClick={onClose} className="ml-auto text-slate-500 hover:text-white"><X size={14}/></button>
    </div>
  </div>
);

// --- Main App Component ---

const App: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'app'>('landing');
  const [notification, setNotification] = useState<{msg: string, type: string} | null>(null);
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem('demo-mode') !== 'false';
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
      setView('app');
    }
  }, []);

  const notify = (msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
    setView('app');
  };

  const handleLogout = () => {
    clearUserSession();
    setUser(null);
    setView('landing');
  };

  // Toggle demo mode
  const toggleDemoMode = (enabled: boolean) => {
    setDemoMode(enabled);
    localStorage.setItem('demo-mode', enabled.toString());
    notify(`Demo mode ${enabled ? 'enabled' : 'disabled'}`, 'success');
  };

  // Check if current URL is a client signup link (public route)
  const isClientSignupRoute = window.location.hash.startsWith('#/client-signup/');

  // If it's a client signup route, render it directly without auth
  if (isClientSignupRoute) {
    return (
      <NotificationContext.Provider value={{ notify }}>
        <HashRouter>
          <Routes>
            <Route path="/client-signup/:token" element={<ClientSignup />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
        {notification && <Toast message={notification.msg} type={notification.type} onClose={() => setNotification(null)} />}
      </NotificationContext.Provider>
    );
  }

  // Logic to render based on view state
  if (view === 'landing') {
      return <LandingPage onLoginClick={() => setView('login')} onSignupClick={() => setView('signup')} />;
  }

  if (view === 'login') {
    return <Login onLogin={handleLogin} />;
  }

  if (view === 'signup') {
    return <Signup onSignupComplete={() => setView('login')} onBackToLogin={() => setView('login')} />;
  }

  // App View (Logged In)
  return (
    <NotificationContext.Provider value={{ notify }}>
      <HashRouter>
        <div className="min-h-screen font-sans selection:bg-brand-500/30 selection:text-brand-100">
          {notification && (
            <Toast 
              message={notification.msg} 
              type={notification.type} 
              onClose={() => setNotification(null)} 
            />
          )}
          
          <Sidebar isOpen={isSidebarOpen} toggle={() => setSidebarOpen(false)} onLogout={handleLogout} currentUser={user} />
          <Header onMenuClick={() => setSidebarOpen(true)} user={user} />

          {/* Demo Mode Badge */}
          {demoMode && (
            <div className="lg:pl-64 px-4 lg:px-8 pt-4">
              <div className="max-w-[1600px] mx-auto">
                <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-lg px-4 py-2.5 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🎮</span>
                    <span className="text-sm font-semibold text-amber-200">Demo Mode</span>
                  </div>
                  <div className="h-4 w-px bg-amber-500/30"></div>
                  <p className="text-xs text-amber-100/80 flex-1">
                    You're viewing sample data. All features are fully functional for demonstration purposes.
                  </p>
                  <button
                    onClick={() => notify("Demo mode helps you explore all features without real data. Toggle it off in Settings.", "info")}
                    className="text-xs text-amber-300 hover:text-amber-100 font-medium transition-colors"
                  >
                    Learn More
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="lg:pl-64 pt-4 pb-12 px-4 lg:px-8 max-w-[1600px] mx-auto transition-all duration-300">
             <Routes>
               <Route path="/" element={<Dashboard demoMode={demoMode} />} />
               <Route path="/calls" element={<CallAnalysis />} />
               <Route path="/roleplay" element={<Roleplay />} />
               {/* Pass currentUser to TrainingLibrary for upload permissions */}
               <Route path="/training" element={<TrainingLibrary currentUser={user!} />} />
               <Route path="/team" element={<TeamPerformance demoMode={demoMode} />} />
               <Route path="/campaigns" element={<Campaigns />} />
               <Route path="/ai-agents" element={<AIAgentConfig currentUser={user!} />} />
               <Route path="/clients" element={<ClientManagement currentUser={user!} />} />
               <Route path="/admin" element={<AdminUsers />} />
               <Route path="/settings" element={<Settings demoMode={demoMode} onToggleDemoMode={toggleDemoMode} currentUser={user} onUserUpdate={setUser} />} />
               <Route path="*" element={<Navigate to="/" replace />} />
             </Routes>
          </main>
        </div>
      </HashRouter>
    </NotificationContext.Provider>
  );
};

export default App;
