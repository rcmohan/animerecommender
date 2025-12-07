import React from 'react';
import { SectionTitle, Card, Button } from './Shared';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export const PrivacyPolicy: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
        <Button onClick={onBack} variant="secondary" className="mb-6">
          <ArrowLeft size={16} /> Back
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="p-4 bg-pink-500/10 rounded-2xl text-pink-500">
            <ShieldCheck size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Privacy Policy</h1>
            <p className="text-zinc-400">Last Updated: October 2023</p>
          </div>
        </div>

        <Card className="prose prose-invert max-w-none text-zinc-300 space-y-6">
          <section>
            <h3 className="text-xl font-bold text-white mb-2">1. Information We Collect</h3>
            <p>
              We collect the email address you provide upon registration and the anime viewing data (titles, episodes, ratings, likes/dislikes) you voluntarily enter into the application.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">2. How We Use Your Data</h3>
            <p>
              Your data is used solely to provide the AniPink service:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>To persist your watchlist across devices.</li>
              <li>To generate AI-powered recommendations based on your preferences.</li>
              <li>To calculate arc completion estimates.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">3. Data Storage</h3>
            <p>
              Your data is stored securely in Google Cloud Firestore (Firebase). We implement security rules to ensure only you can access and modify your personal watchlist.
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold text-white mb-2">4. Third-Party Sharing</h3>
            <p>
              We do not sell your personal data. We use Google Gemini API to process anime titles for recommendations, but we do not send your email or personally identifiable information to the AI model—only the anime metadata.
            </p>
          </section>

           <section>
            <h3 className="text-xl font-bold text-white mb-2">5. Your Rights</h3>
            <p>
              You may request the deletion of your account and all associated data at any time by contacting support.
            </p>
          </section>
        </Card>
      </div>
    </div>
  );
};
