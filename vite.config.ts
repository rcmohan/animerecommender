import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');

  // validation during build
  const geminiKey = process.env.GEMINI_API_KEY || env.GEMINI_API_KEY;
  const firebaseKey = process.env.FIREBASE_API_KEY || env.FIREBASE_API_KEY;

  if (mode === 'production' && (!geminiKey || !firebaseKey)) {
    console.error("❌ ERROR: Missing API Keys during build!");
    console.error("   FIREBASE_API_KEY present: " + !!firebaseKey);
    console.error("   GEMINI_API_KEY present: " + !!geminiKey);
    console.error("   Make sure these are set in Cloud Build Trigger substitutions!");
    // We allow the build to proceed but warn heavily, or should we throw?
    // Throwing stops the broken build deploy which is better.
    throw new Error("Missing API Keys in build environment.");
  }

  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/api': 'http://localhost:8080'
      }
    },
    plugins: [react()],
    define: {
      // Prioritize system env vars (from Docker ENV) over .env files
      'process.env.API_KEY': JSON.stringify(geminiKey),
      'process.env.GEMINI_API_KEY': JSON.stringify(geminiKey),
      'process.env.FIREBASE_API_KEY': JSON.stringify(firebaseKey)
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
