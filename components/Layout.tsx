import React, { useState, useEffect } from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, BrainCircuit, Heart, User, LogOut, Tv, Menu, X, Sparkles } from 'lucide-react';
import { Button } from './Shared';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
  onLogout: () => void;
  isGuest: boolean;
}

const NavLink = ({ 
  active, 
  label, 
  onClick,
  icon: Icon 
}: { 
  active: boolean; 
  label: string; 
  onClick: () => void;
  icon: any;
}) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
      active 
        ? 'text-white' 
        : 'text-zinc-400 hover:text-white'
    }`}
  >
    <Icon size={16} className={active ? "text-pink-500" : ""} />
    {label}
    {active && (
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-pink-500 rounded-full shadow-[0_0_8px_2px_rgba(236,72,153,0.8)]"></span>
    )}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, onLogout, isGuest }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 font-sans selection:bg-pink-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[10%] right-[-5%] w-[400px] h-[400px] bg-pink-900/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-indigo-900/10 rounded-full blur-[80px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
      </div>

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/5 py-3' : 'bg-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView(ViewState.DASHBOARD)}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg shadow-pink-500/20 group-hover:scale-110 transition-transform">
              <Tv size={20} className="text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-white tracking-tight group-hover:text-pink-100 transition-colors">
              Ani<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Pink</span>
            </h1>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 bg-white/5 backdrop-blur-md p-1.5 rounded-full border border-white/10">
            <NavLink active={currentView === ViewState.DASHBOARD} icon={LayoutDashboard} label="Dashboard" onClick={() => setView(ViewState.DASHBOARD)} />
            <NavLink active={currentView === ViewState.PREDICTOR} icon={BrainCircuit} label="Predictor" onClick={() => setView(ViewState.PREDICTOR)} />
            <NavLink active={currentView === ViewState.RECOMMENDATIONS} icon={Sparkles} label="Discover" onClick={() => setView(ViewState.RECOMMENDATIONS)} />
            <NavLink active={currentView === ViewState.PROFILE} icon={User} label="Profile" onClick={() => setView(ViewState.PROFILE)} />
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center gap-4">
            {isGuest ? (
              <Button onClick={onLogout} variant="secondary" className="px-6 rounded-full text-sm">
                Register to Save
              </Button>
            ) : (
              <button onClick={onLogout} className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-colors text-sm font-medium">
                <LogOut size={16} />
                Sign Out
              </button>
            )}
          </div>

          {/* Mobile Toggle */}
          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(true)}>
            <Menu size={28} />
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-zinc-950/95 backdrop-blur-xl p-6 md:hidden flex flex-col animate-in fade-in duration-200">
          <div className="flex justify-between items-center mb-10">
            <span className="text-xl font-bold text-white">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="text-zinc-400 hover:text-white">
              <X size={28} />
            </button>
          </div>
          <nav className="flex flex-col gap-4 text-lg">
            <button onClick={() => { setView(ViewState.DASHBOARD); setMobileMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl ${currentView === ViewState.DASHBOARD ? 'bg-pink-500/20 text-pink-500' : 'text-zinc-400'}`}>
              <LayoutDashboard /> Dashboard
            </button>
            <button onClick={() => { setView(ViewState.PREDICTOR); setMobileMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl ${currentView === ViewState.PREDICTOR ? 'bg-pink-500/20 text-pink-500' : 'text-zinc-400'}`}>
              <BrainCircuit /> Predictor
            </button>
            <button onClick={() => { setView(ViewState.RECOMMENDATIONS); setMobileMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl ${currentView === ViewState.RECOMMENDATIONS ? 'bg-pink-500/20 text-pink-500' : 'text-zinc-400'}`}>
              <Sparkles /> Discover
            </button>
            <button onClick={() => { setView(ViewState.PROFILE); setMobileMenuOpen(false); }} className={`flex items-center gap-4 p-4 rounded-xl ${currentView === ViewState.PROFILE ? 'bg-pink-500/20 text-pink-500' : 'text-zinc-400'}`}>
              <User /> Profile
            </button>
            <div className="h-px bg-white/10 my-4"></div>
            <button onClick={onLogout} className="flex items-center gap-4 p-4 text-red-400">
              <LogOut /> {isGuest ? 'Back to Login' : 'Sign Out'}
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="relative z-10 pt-28 pb-24 px-6 max-w-7xl mx-auto min-h-screen">
        {children}
      </main>

      {/* Guest Mode Sticky Banner */}
      {isGuest && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black via-zinc-900/90 to-transparent pt-12 pb-6 px-6">
          <div className="max-w-2xl mx-auto bg-zinc-900 border border-pink-500/30 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_30px_rgba(236,72,153,0.2)] animate-in slide-in-from-bottom-full duration-700">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-500">
                <Sparkles size={20} />
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">You are in Guest Mode</h4>
                <p className="text-zinc-400 text-xs">Your progress won't be saved on other devices.</p>
              </div>
            </div>
            <Button onClick={onLogout} variant="primary" className="text-sm px-4 py-2 h-auto">
              Create Account
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};