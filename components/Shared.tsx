import React from 'react';

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost' }> = ({ 
  children, 
  variant = 'primary', 
  className = '', 
  ...props 
}) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-pink-600 hover:bg-pink-500 text-white shadow-lg shadow-pink-600/20",
    secondary: "bg-zinc-800 hover:bg-zinc-700 text-pink-100 border border-zinc-700",
    ghost: "bg-transparent hover:bg-white/5 text-pink-400"
  };

  return (
    <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className = '', ...props }) => (
  <input 
    className={`w-full bg-zinc-900 border border-zinc-800 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-colors placeholder-zinc-500 ${className}`}
    {...props}
  />
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-zinc-900/60 backdrop-blur-sm border border-white/5 rounded-xl p-6 ${className}`}>
    {children}
  </div>
);

export const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-white mb-1 flex items-center gap-2">
      <span className="w-1 h-6 bg-pink-500 rounded-full block"></span>
      {title}
    </h2>
    {subtitle && <p className="text-zinc-400 text-sm ml-3">{subtitle}</p>}
  </div>
);
