import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' | 'danger' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-display font-medium transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 relative overflow-hidden group";
  
  const variants = {
    primary: "bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] border border-white/10",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10 backdrop-blur-md",
    ghost: "bg-transparent hover:bg-pink-500/10 text-zinc-400 hover:text-pink-400",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      {variant === 'primary' && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
      )}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <div className="relative group">
    <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl opacity-0 group-focus-within:opacity-50 transition duration-500 blur"></div>
    <input 
      className={`relative w-full bg-zinc-900/90 border border-white/10 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-transparent focus:ring-0 transition-all placeholder-zinc-600 ${className}`}
      {...props}
    />
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; hoverEffect?: boolean }> = ({ 
  children, 
  className = '',
  hoverEffect = false
}) => (
  <div className={`glass-card rounded-2xl p-6 ${hoverEffect ? 'hover:scale-[1.02] hover:-translate-y-1 transition-all duration-300' : ''} ${className}`}>
    {children}
  </div>
);

export const SectionTitle: React.FC<{ title: string; subtitle?: string; icon?: any }> = ({ title, subtitle, icon: Icon }) => (
  <div className="mb-8">
    <h2 className="text-3xl font-display font-bold text-white mb-2 flex items-center gap-3">
      {Icon && <div className="p-2 rounded-lg bg-pink-500/10 text-pink-500"><Icon size={24} /></div>}
      {title}
    </h2>
    {subtitle && <p className="text-zinc-400 font-light tracking-wide">{subtitle}</p>}
  </div>
);

export const Badge: React.FC<{ children: React.ReactNode; variant?: 'pink' | 'blue' | 'yellow' | 'green' }> = ({ children, variant = 'pink' }) => {
  const styles = {
    pink: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
  };
  
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} inline-flex items-center gap-1`}>
      {children}
    </span>
  );
};