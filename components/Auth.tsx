import React, { useState } from 'react';
import { Button, Input } from './Shared';
import { 
  auth, 
  initializeUserDoc, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from '../services/firebase';
import { AlertCircle, Check, Tv, ArrowRight, Sparkles } from 'lucide-react';

interface AuthProps {
  onLogin: () => void;
  onViewPrivacy: () => void;
}

export const AuthView: React.FC<AuthProps> = ({ onLogin, onViewPrivacy }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!email.includes('@')) return "Please enter a valid email.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (isRegistering) {
      if (password !== confirmPassword) return "Passwords do not match.";
      if (!consent) return "You must accept the data policy to register.";
    }
    return null;
  };

  const handleSubmit = async () => {
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      if (isRegistering) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await initializeUserDoc(cred.user);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(); 
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = "An error occurred.";
      if (err.message) msg = err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.05]"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-[420px]">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-violet-600 shadow-[0_0_40px_rgba(236,72,153,0.4)] mb-6 transform rotate-3 hover:rotate-6 transition-transform">
            <Tv size={32} className="text-white" />
          </div>
          <h1 className="text-5xl font-display font-bold tracking-tighter text-white mb-2 text-glow">
            Ani<span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500">Pink</span>
          </h1>
          <p className="text-zinc-400 text-lg">Your anime journey, elevated.</p>
        </div>

        {/* Auth Card */}
        <div className="glass-card rounded-3xl p-8 backdrop-blur-xl border border-white/10 shadow-2xl relative overflow-hidden">
          
          {/* Top Tabs */}
          <div className="flex gap-2 p-1 bg-black/20 rounded-xl mb-8">
            <button 
              onClick={() => { setIsRegistering(false); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${!isRegistering ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => { setIsRegistering(true); setError(null); }}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${isRegistering ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Register
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <Input 
                type="email" 
                placeholder="Email Address" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-black/30"
              />
            </div>
            
            <div>
              <Input 
                type="password" 
                placeholder="Password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/30"
              />
            </div>

            {isRegistering && (
              <div className="animate-in slide-in-from-top-4 fade-in duration-300 space-y-5">
                <Input 
                  type="password" 
                  placeholder="Confirm Password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-black/30"
                />
                
                <label className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors group">
                   <div className="relative mt-0.5">
                      <input 
                        type="checkbox" 
                        className="peer sr-only"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      <div className="w-5 h-5 rounded border border-zinc-600 bg-black/50 peer-checked:bg-pink-500 peer-checked:border-pink-500 transition-all"></div>
                      <Check size={14} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                   </div>
                   <span className="text-xs text-zinc-400 leading-relaxed">
                     I agree to the <span className="text-pink-400 group-hover:text-pink-300">Privacy Policy</span> and consent to data processing for app features.
                   </span>
                </label>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs animate-in shake duration-300">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full h-12 text-lg" disabled={loading}>
              {loading ? <Sparkles className="animate-spin" /> : (isRegistering ? "Start Tracking" : "Enter Portal")}
              {!loading && <ArrowRight size={18} />}
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center space-y-4">
          <button onClick={onViewPrivacy} className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors uppercase tracking-widest font-medium">
            Privacy Policy
          </button>
        </div>
      </div>
    </div>
  );
};