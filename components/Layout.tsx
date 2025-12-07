import React, { useState } from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, BrainCircuit, Heart, User, LogOut, Tv } from 'lucide-react';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  onLogout: () => void;
}

const NavItem = ({ 
  active, 
  icon: Icon, 
  label, 
  onClick 
}: { 
  active: boolean; 
  icon: any; 
  label: string; 
  onClick: () => void 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-pink-600/10 text-pink-500 border border-pink-500/20' 
        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
    }`}
  >
    <Icon size={20} className={active ? "text-pink-500" : "text-zinc-500 group-hover:text-white"} />
    <span className="font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-pink-500 shadow-[0_0_8px_2px_rgba(236,72,153,0.5)]"></div>}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden selection:bg-pink-500/30">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-zinc-950/50 backdrop-blur-xl h-screen p-6 fixed z-50">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Tv size={18} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Ani<span className="text-pink-500">Pink</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem 
            active={currentView === ViewState.DASHBOARD} 
            icon={LayoutDashboard} 
            label="Dashboard" 
            onClick={() => setView(ViewState.DASHBOARD)} 
          />
          <NavItem 
            active={currentView === ViewState.PREDICTOR} 
            icon={BrainCircuit} 
            label="Predictor" 
            onClick={() => setView(ViewState.PREDICTOR)} 
          />
          <NavItem 
            active={currentView === ViewState.RECOMMENDATIONS} 
            icon={Tv} 
            label="Recommendations" 
            onClick={() => setView(ViewState.RECOMMENDATIONS)} 
          />
          <NavItem 
            active={currentView === ViewState.PROFILE} 
            icon={User} 
            label="Profile & Likes" 
            onClick={() => setView(ViewState.PROFILE)} 
          />
        </nav>

        <div className="pt-6 border-t border-white/5">
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 relative overflow-y-auto h-screen bg-dots">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-6 border-b border-white/5 bg-zinc-950/80 backdrop-blur-lg sticky top-0 z-40">
           <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500 flex items-center justify-center">
              <Tv size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold">Ani<span className="text-pink-500">Pink</span></h1>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-zinc-400">
             <div className="space-y-1.5">
               <span className="block w-6 h-0.5 bg-current"></span>
               <span className="block w-6 h-0.5 bg-current"></span>
               <span className="block w-6 h-0.5 bg-current"></span>
             </div>
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-lg p-6">
            <div className="flex justify-end mb-8">
               <button onClick={() => setMobileMenuOpen(false)} className="text-white text-2xl">&times;</button>
            </div>
            <nav className="space-y-4">
              <NavItem active={currentView === ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" onClick={() => { setView(ViewState.DASHBOARD); setMobileMenuOpen(false); }} />
              <NavItem active={currentView === ViewState.PREDICTOR} icon={BrainCircuit} label="Predictor" onClick={() => { setView(ViewState.PREDICTOR); setMobileMenuOpen(false); }} />
              <NavItem active={currentView === ViewState.RECOMMENDATIONS} icon={Tv} label="Recommendations" onClick={() => { setView(ViewState.RECOMMENDATIONS); setMobileMenuOpen(false); }} />
              <NavItem active={currentView === ViewState.PROFILE} icon={User} label="Profile" onClick={() => { setView(ViewState.PROFILE); setMobileMenuOpen(false); }} />
               <button onClick={onLogout} className="flex items-center gap-3 px-4 py-3 text-red-400 w-full mt-8 border-t border-white/10 pt-6">
                <LogOut size={20} /> Sign Out
              </button>
            </nav>
          </div>
        )}

        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
      
      {/* Aesthetic Background Element */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-20">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-pink-600 rounded-full blur-[128px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600 rounded-full blur-[128px]"></div>
      </div>
    </div>
  );
};
