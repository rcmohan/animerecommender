import React, { useState } from 'react';
import { Card, Button, Input } from './Shared';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, initializeUserDoc } from '../services/firebase';
import { AlertCircle, Check, Tv, Heart } from 'lucide-react';

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
      onLogin(); // Parent component handles redirection via auth listener
    } catch (err: any) {
      let msg = "An error occurred.";
      if (err.code === 'auth/email-already-in-use') msg = "Email already in use.";
      if (err.code === 'auth/invalid-credential') msg = "Invalid email or password.";
      if (err.code === 'auth/weak-password') msg = "Password is too weak.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      {/* Aesthetic Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-900/30 rounded-full blur-[80px]"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl shadow-pink-900/20 border border-white/5 bg-zinc-900/80 backdrop-blur-xl">
        
        {/* Left Side: Illustration/Brand */}
        <div className="hidden md:flex flex-col justify-center items-center p-12 bg-gradient-to-br from-pink-950 via-zinc-900 to-black text-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-pink-500/30">
            <Tv size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tighter mb-4">Ani<span className="text-pink-500">Pink</span></h1>
          <p className="text-zinc-400 mb-8 max-w-xs">
            Track your arcs, predict your journey, and discover your next obsession.
          </p>
          <div className="flex gap-2">
            {[1,2,3].map(i => (
              <div key={i} className="w-2 h-2 rounded-full bg-zinc-700 data-[active=true]:bg-pink-500 data-[active=true]:scale-125 transition-all" data-active={i===1}></div>
            ))}
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              {isRegistering ? "Start Your Journey" : "Welcome Back"}
            </h2>
            <p className="text-sm text-zinc-400">
              {isRegistering ? "Create an account to sync your watchlist." : "Enter the void to continue tracking."}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Email</label>
              <Input 
                type="email" 
                placeholder="senpai@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Password</label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {isRegistering && (
              <>
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Confirm Password</label>
                  <Input 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Must be at least 8 characters. Include numbers and symbols for better security.
                  </p>
                </div>

                <div className="flex items-start gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                   <div className="relative flex items-center">
                      <input 
                        type="checkbox" 
                        id="consent" 
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border border-zinc-700 bg-zinc-900 transition-all checked:border-pink-500 checked:bg-pink-500"
                        checked={consent}
                        onChange={(e) => setConsent(e.target.checked)}
                      />
                      <Check size={14} className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100" />
                   </div>
                   <label htmlFor="consent" className="text-xs text-zinc-400 cursor-pointer select-none">
                     I consent to AniPink storing my data (email, preferences, history) for app functionality. 
                     Data is stored securely. View <button onClick={onViewPrivacy} className="text-pink-500 underline hover:text-pink-400">Privacy Policy</button>.
                   </label>
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <Button onClick={handleSubmit} className="w-full mt-2" disabled={loading}>
              {loading ? "Processing..." : (isRegistering ? "Create Account" : "Sign In")}
            </Button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 text-center">
            <p className="text-sm text-zinc-500">
              {isRegistering ? "Already have an account? " : "New to AniPink? "}
              <button 
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }} 
                className="text-pink-500 font-medium hover:text-pink-400 transition-colors"
              >
                {isRegistering ? "Sign In" : "Register Now"}
              </button>
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer Links */}
      <div className="absolute bottom-4 left-0 w-full text-center">
         <button onClick={onViewPrivacy} className="text-xs text-zinc-600 hover:text-zinc-400">Privacy Policy</button>
      </div>
    </div>
  );
};
