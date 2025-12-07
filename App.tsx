import React, { useState, useEffect } from 'react';
import { ViewState, Anime, AnimeStatus, UserProfile, Recommendation } from './types';
import { Layout } from './components/Layout';
import { Button, Input, Card, SectionTitle } from './components/Shared';
import { AuthView } from './components/Auth';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { getAnimeArcInfo, getCompletionProbability, getRecommendations, getMotivationalMessage } from './services/geminiService';
import { subscribeToAuth, subscribeToAnimeList, subscribeToProfile, saveAnimeToFirestore, updateUserProfileFirestore, logoutUser } from './services/firebase';
import { Play, Plus, Star, X, Check, Brain, AlertCircle, BrainCircuit } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

// --- MOCK DATA FOR GUEST MODE ---
const SAMPLE_ANIME: Anime[] = [
  { 
    id: '1', 
    title: 'One Piece', 
    currentEpisode: 1089, 
    status: AnimeStatus.WATCHING, 
    currentArc: 'Egghead Island', 
    episodesToArcEnd: 15,
    totalEpisodes: 1100, 
    rating: 9 
  },
  { 
    id: '2', 
    title: 'Frieren: Beyond Journey\'s End', 
    currentEpisode: 28, 
    status: AnimeStatus.COMPLETED, 
    totalEpisodes: 28, 
    rating: 10 
  }
];

// --- DASHBOARD VIEW ---
const DashboardView = ({ 
  animeList, 
  onUpdateAnime, 
  onAddAnime,
  onRateAnime
}: { 
  animeList: Anime[], 
  onUpdateAnime: (id: string, ep: number) => void,
  onAddAnime: (title: string, currentEp: number) => void,
  onRateAnime: (id: string, rating: number) => void
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newEp, setNewEp] = useState('1');
  const [loading, setLoading] = useState(false);
  const [showHoldWarning, setShowHoldWarning] = useState<string | null>(null);

  const handleAdd = async () => {
    if (!newTitle) return;
    setLoading(true);
    await onAddAnime(newTitle, parseInt(newEp) || 1);
    setLoading(false);
    setNewTitle('');
    setNewEp('1');
  };

  const attemptHold = async (title: string) => {
    const msg = await getMotivationalMessage(title);
    setShowHoldWarning(msg);
  };

  const watching = animeList.filter(a => a.status === AnimeStatus.WATCHING);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Tracker List */}
        <div className="lg:col-span-2 space-y-6">
          <SectionTitle title="Currently Watching" subtitle="Keep up the pace!" />
          
          <div className="space-y-4">
            {watching.map(anime => (
              <Card key={anime.id} className="group hover:border-pink-500/40 transition-all">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-white">{anime.title}</h3>
                      {anime.rating && (
                         <span className="bg-yellow-500/10 text-yellow-500 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                           <Star size={10} fill="currentColor" /> {anime.rating}
                         </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-4 text-sm text-zinc-400">
                      <div className="flex items-center gap-1">
                        <Play size={14} className="text-pink-500" />
                        Ep {anime.currentEpisode} / {anime.totalEpisodes || '?'}
                      </div>
                      {anime.currentArc && (
                         <div className="flex items-center gap-1 text-pink-300">
                           <BrainCircuit size={14} />
                           Arc: {anime.currentArc}
                         </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button 
                      onClick={() => onUpdateAnime(anime.id, anime.currentEpisode + 1)}
                      className="p-2 bg-pink-600 rounded-lg hover:bg-pink-500 text-white transition-colors"
                      title="Watched next episode"
                    >
                      <Plus size={18} />
                    </button>
                    <button
                        onClick={() => attemptHold(anime.title)}
                        className="p-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 text-zinc-400 text-xs font-medium"
                    >
                        Hold
                    </button>
                    {/* Simple Rating Dropdown */}
                    <select 
                      className="bg-zinc-800 text-white text-sm rounded-lg p-2 border-none outline-none focus:ring-1 focus:ring-pink-500"
                      value={anime.rating || ''}
                      onChange={(e) => onRateAnime(anime.id, parseInt(e.target.value))}
                    >
                      <option value="">Rate</option>
                      {[10,9,8,7,6,5,4,3,2,1].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                </div>

                {/* Progress Bar for Arc */}
                {anime.episodesToArcEnd !== undefined && anime.episodesToArcEnd > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-zinc-500 mb-1">
                      <span>Arc Progress</span>
                      <span>{anime.episodesToArcEnd} eps left in arc</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                       <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                )}
              </Card>
            ))}
            
            {watching.length === 0 && (
                <div className="text-zinc-500 italic text-center py-10">No anime in progress. Start something new!</div>
            )}
          </div>
        </div>

        {/* Quick Add Sidebar */}
        <div className="space-y-6">
           <SectionTitle title="New Journey" />
           <Card>
              <div className="space-y-3">
                <Input 
                  placeholder="Anime Title..." 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)} 
                />
                <div className="flex gap-2">
                   <Input 
                    type="number" 
                    placeholder="Ep #" 
                    className="w-24"
                    value={newEp}
                    onChange={(e) => setNewEp(e.target.value)}
                  />
                   <Button onClick={handleAdd} disabled={loading} className="flex-1">
                     {loading ? 'Analyzing...' : 'Track'}
                   </Button>
                </div>
                <p className="text-xs text-zinc-500 mt-2">
                  *AI will automatically fetch arc info.
                </p>
              </div>
           </Card>
        </div>
      </div>

      {/* Motivational Modal (Fake Hold Prevention) */}
      {showHoldWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-pink-500 p-6 rounded-2xl max-w-sm w-full text-center relative shadow-[0_0_50px_rgba(236,72,153,0.3)]">
            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-pink-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Not so fast!</h3>
            <p className="text-pink-200 mb-6 italic">"{showHoldWarning}"</p>
            <Button onClick={() => setShowHoldWarning(null)} className="w-full">
              Okay, I'll keep watching!
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- PREDICTOR VIEW ---
const PredictorView = ({ userProfile }: { userProfile: UserProfile }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{probability: number, reason: string} | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!query) return;
    setLoading(true);
    const res = await getCompletionProbability(query, userProfile.likes);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <SectionTitle title="Will You Finish It?" />
        <p className="text-zinc-400">Enter an anime you're thinking about starting. Our AI analyzes your tastes and the show's pacing to predict your success rate.</p>
      </div>

      <div className="flex gap-4">
        <Input 
          placeholder="e.g., One Piece, Naruto, Steins;Gate..." 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          className="text-lg"
        />
        <Button onClick={handlePredict} disabled={loading} className="px-8">
          {loading ? 'Calculating...' : 'Predict'}
        </Button>
      </div>

      {result && (
        <Card className="text-center py-10 border-pink-500/30 bg-gradient-to-b from-zinc-900 to-zinc-950">
          <div className="mb-4 text-zinc-400 uppercase tracking-widest text-xs font-bold">Probability of Completion</div>
          <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-6">
            {result.probability}%
          </div>
          <p className="text-xl text-white font-light italic">"{result.reason}"</p>
          
          <div className="mt-8 h-2 w-64 mx-auto bg-zinc-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-1000 ${result.probability > 50 ? 'bg-green-500' : 'bg-red-500'}`} 
              style={{ width: `${result.probability}%` }}
            ></div>
          </div>
        </Card>
      )}
    </div>
  );
};

// --- PROFILE VIEW ---
const ProfileView = ({ 
  userProfile, 
  onUpdateProfile
}: { 
  userProfile: UserProfile, 
  onUpdateProfile: (updates: Partial<UserProfile>) => void 
}) => {
  const [inputLike, setInputLike] = useState('');
  const [inputDislike, setInputDislike] = useState('');

  const addLike = () => {
    if (inputLike && !userProfile.likes.includes(inputLike)) {
      onUpdateProfile({ likes: [...userProfile.likes, inputLike] });
      setInputLike('');
    }
  };

  const addDislike = () => {
    if (inputDislike && !userProfile.dislikes.includes(inputDislike)) {
      onUpdateProfile({ dislikes: [...userProfile.dislikes, inputDislike] });
      setInputDislike('');
    }
  };

  const removeLike = (item: string) => {
     onUpdateProfile({ likes: userProfile.likes.filter(i => i !== item) });
  }

  const removeDislike = (item: string) => {
     onUpdateProfile({ dislikes: userProfile.dislikes.filter(i => i !== item) });
  }

  // Stats for charts (Mock data for visualization)
  const chartData = [
    { name: 'Action', value: 12 },
    { name: 'Romance', value: 5 },
    { name: 'Sci-Fi', value: 8 },
    { name: 'Fantasy', value: 15 },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <SectionTitle title="Your Taste Profile" subtitle="Help the AI understand you better" />
        
        {/* Likes */}
        <Card>
          <div className="flex items-center gap-2 mb-4 text-pink-400">
            <Brain size={20} />
            <h3 className="font-bold text-white">I Like...</h3>
          </div>
          <div className="flex gap-2 mb-4">
            <Input 
              value={inputLike} 
              onChange={(e) => setInputLike(e.target.value)} 
              placeholder="e.g. Attack on Titan" 
              className="py-2"
            />
            <Button onClick={addLike} variant="secondary"><Plus size={18} /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {userProfile.likes.map(like => (
              <span key={like} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm border border-green-500/20 flex items-center gap-2">
                {like}
                <button onClick={() => removeLike(like)} className="hover:text-white"><X size={12}/></button>
              </span>
            ))}
            {userProfile.likes.length === 0 && <span className="text-zinc-500 text-sm">No likes added yet.</span>}
          </div>
        </Card>

        {/* Dislikes */}
        <Card>
          <div className="flex items-center gap-2 mb-4 text-purple-400">
            <BrainCircuit size={20} />
            <h3 className="font-bold text-white">I Dislike...</h3>
          </div>
          <div className="flex gap-2 mb-4">
            <Input 
              value={inputDislike} 
              onChange={(e) => setInputDislike(e.target.value)} 
              placeholder="e.g. Fillers" 
              className="py-2"
            />
            <Button onClick={addDislike} variant="secondary"><Plus size={18} /></Button>
          </div>
          <div className="flex flex-wrap gap-2">
             {userProfile.dislikes.map(dislike => (
              <span key={dislike} className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm border border-red-500/20 flex items-center gap-2">
                {dislike}
                <button onClick={() => removeDislike(dislike)} className="hover:text-white"><X size={12}/></button>
              </span>
            ))}
             {userProfile.dislikes.length === 0 && <span className="text-zinc-500 text-sm">No dislikes added yet.</span>}
          </div>
        </Card>
      </div>

      <div className="space-y-6">
         <SectionTitle title="Watch Statistics" />
         <Card className="h-80 flex flex-col justify-center">
            <h3 className="text-center text-zinc-400 mb-4 text-sm">Genre Distribution</h3>
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#333', color: '#fff' }}
                  itemStyle={{ color: '#ec4899' }}
                  cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
         </Card>
      </div>
    </div>
  );
};

// --- RECOMMENDATIONS VIEW ---
const RecommendationsView = ({ 
  animeList, 
  userProfile 
}: { 
  animeList: Anime[], 
  userProfile: UserProfile 
}) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchRecs = async () => {
    setLoading(true);
    const recs = await getRecommendations(animeList, userProfile.likes, userProfile.dislikes);
    setRecommendations(recs);
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <SectionTitle title="AI Curated For You" />
          <p className="text-zinc-400">Based on your {animeList.length} watched shows and preferences.</p>
        </div>
        <Button onClick={fetchRecs} disabled={loading} className="w-full md:w-auto">
          {loading ? 'Generating...' : 'Get New Recommendations'}
        </Button>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, i) => (
            <Card key={i} className="flex flex-col h-full border-pink-500/20 hover:scale-105 transition-transform duration-300">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="text-xl font-bold text-white">{rec.title}</h3>
                   <span className="bg-pink-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                     {rec.matchScore}% Match
                   </span>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">{rec.reason}</p>
              </div>
              <Button variant="secondary" className="mt-6 w-full text-sm">Add to Plan to Watch</Button>
            </Card>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl">
             <Brain size={48} className="mx-auto text-zinc-700 mb-4" />
             <p className="text-zinc-500">Hit the button to analyze your taste matrix.</p>
          </div>
        )
      )}
    </div>
  );
};


// --- MAIN APP COMPONENT ---
const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [currentView, setView] = useState<ViewState>(ViewState.AUTH);
  
  // State
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'Guest',
    likes: [],
    dislikes: []
  });

  // Init Auth Listener
  useEffect(() => {
    const unsubscribe = subscribeToAuth((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setView(ViewState.DASHBOARD);
      } else {
        setUser(null);
        // Don't auto-redirect if viewing Privacy Policy
        if (currentView !== ViewState.PRIVACY_POLICY) {
           setView(ViewState.AUTH);
        }
        setAnimeList(SAMPLE_ANIME); // Reset to samples/guest mode
      }
    });
    return () => unsubscribe();
  }, [currentView]);

  // Init Data Listeners when User is present
  useEffect(() => {
    if (!user) return;

    const unsubAnime = subscribeToAnimeList(user.uid, (list) => {
      setAnimeList(list);
    });

    const unsubProfile = subscribeToProfile(user.uid, (profile) => {
      setUserProfile(profile);
    });

    return () => {
      unsubAnime();
      unsubProfile();
    };
  }, [user]);

  // --- ACTIONS (Route to Firebase or Local State) ---

  const handleUpdateAnime = async (id: string, newEpisode: number) => {
    if (user) {
      // Find current state to calculate optimistic updates or logic
      const currentAnime = animeList.find(a => a.id === id);
      if (!currentAnime) return;

      const newArcEps = currentAnime.episodesToArcEnd ? Math.max(0, currentAnime.episodesToArcEnd - 1) : undefined;
      const newStatus = (currentAnime.totalEpisodes && newEpisode >= currentAnime.totalEpisodes) ? AnimeStatus.COMPLETED : currentAnime.status;

      const updated = { 
          ...currentAnime, 
          currentEpisode: newEpisode, 
          episodesToArcEnd: newArcEps,
          status: newStatus
      };
      await saveAnimeToFirestore(user.uid, updated);
    } else {
       // Guest Mode (Local State Only)
       setAnimeList(prev => prev.map(a => {
        if (a.id === id) {
          const newArcEps = a.episodesToArcEnd ? Math.max(0, a.episodesToArcEnd - 1) : undefined;
          const newStatus = (a.totalEpisodes && newEpisode >= a.totalEpisodes) ? AnimeStatus.COMPLETED : a.status;
          return { ...a, currentEpisode: newEpisode, episodesToArcEnd: newArcEps, status: newStatus };
        }
        return a;
      }));
    }
  };

  const handleRateAnime = async (id: string, rating: number) => {
      if (user) {
        const currentAnime = animeList.find(a => a.id === id);
        if (currentAnime) {
          await saveAnimeToFirestore(user.uid, { ...currentAnime, rating });
        }
      } else {
         setAnimeList(prev => prev.map(a => a.id === id ? {...a, rating} : a));
      }
  };

  const handleAddAnime = async (title: string, currentEpisode: number) => {
    // 1. Create temp object
    const tempId = Date.now().toString();
    const newAnime: Anime = {
      id: tempId,
      title,
      currentEpisode,
      status: AnimeStatus.WATCHING
    };
    
    // Optimistic Update (Guest) or UI Feedback
    if (!user) setAnimeList(prev => [newAnime, ...prev]);

    // 2. Fetch AI Data
    try {
      const info = await getAnimeArcInfo(title, currentEpisode);
      const enrichedAnime = {
        ...newAnime,
        currentArc: info.currentArc,
        episodesToArcEnd: info.episodesToArcEnd,
        totalEpisodes: info.totalEpisodes
      };

      if (user) {
        await saveAnimeToFirestore(user.uid, enrichedAnime);
      } else {
         setAnimeList(prev => prev.map(a => a.id === tempId ? enrichedAnime : a));
      }

    } catch (e) {
      console.error("Failed to enrich anime data", e);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (user) {
      await updateUserProfileFirestore(user.uid, updates);
    } else {
      setUserProfile(prev => ({ ...prev, ...updates }));
    }
  }

  // --- ROUTING ---

  if (currentView === ViewState.PRIVACY_POLICY) {
    return <PrivacyPolicy onBack={() => setView(user ? ViewState.DASHBOARD : ViewState.AUTH)} />;
  }

  if (currentView === ViewState.AUTH) {
    return <AuthView onLogin={() => {}} onViewPrivacy={() => setView(ViewState.PRIVACY_POLICY)} />;
  }

  return (
    <Layout 
      currentView={currentView} 
      setView={setView} 
      onLogout={() => {
        logoutUser();
        setView(ViewState.AUTH);
      }}
    >
      {currentView === ViewState.DASHBOARD && (
        <DashboardView 
          animeList={animeList} 
          onUpdateAnime={handleUpdateAnime} 
          onAddAnime={handleAddAnime}
          onRateAnime={handleRateAnime}
        />
      )}
      {currentView === ViewState.PREDICTOR && (
        <PredictorView userProfile={userProfile} />
      )}
      {currentView === ViewState.PROFILE && (
        <ProfileView userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />
      )}
      {currentView === ViewState.RECOMMENDATIONS && (
        <RecommendationsView animeList={animeList} userProfile={userProfile} />
      )}
    </Layout>
  );
};

export default App;
