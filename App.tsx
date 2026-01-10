import React, { useState, useEffect } from 'react';
import { ViewState, Anime, AnimeStatus, UserProfile, Recommendation } from './types';
import { Layout } from './components/Layout';
import { Button, Input, Card, SectionTitle, Badge } from './components/Shared';
import { AuthView } from './components/Auth';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { getAnimeArcInfo, getCompletionProbability, getRecommendations, getMotivationalMessage } from './services/geminiService';
import { subscribeToAuth, subscribeToAnimeList, subscribeToProfile, saveAnimeToFirestore, updateUserProfileFirestore, logoutUser, getUserStatus } from './services/firebase';
import { Play, Plus, Star, X, Check, Brain, AlertCircle, BrainCircuit, Sparkles, TrendingUp, Calendar, Zap, Tv } from 'lucide-react';
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

// --- COMPONENTS ---

const DashboardView = ({
  animeList,
  onUpdateAnime,
  onAddAnime,
  onRateAnime,
  onRefreshArc,
  userProfile
}: {
  animeList: Anime[],
  onUpdateAnime: (id: string, ep: number) => void,
  onAddAnime: (title: string, currentEp: number) => void,
  onRateAnime: (id: string, rating: number) => void,
  onRefreshArc: (id: string) => void,
  userProfile: UserProfile
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
  const completed = animeList.filter(a => a.status === AnimeStatus.COMPLETED);

  return (
    <div className="space-y-12 animate-in fade-in duration-700">

      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-pink-900/40 via-purple-900/40 to-indigo-900/40 border border-white/10 p-8 md:p-12">
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Sparkles size={120} className="text-pink-400" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Okaerinasai, <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">{userProfile.username}</span>
          </h1>
          <p className="text-lg text-zinc-300 mb-8 font-light">
            You've watched <span className="text-white font-bold">{completed.length}</span> series and are currently tracking <span className="text-white font-bold">{watching.length}</span> active journeys.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 bg-black/30 backdrop-blur-md p-4 rounded-2xl border border-white/5 inline-flex">
            <Input
              placeholder="Start tracking a new anime..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="min-w-[200px] border-none bg-transparent"
            />
            <Input
              type="number"
              placeholder="Ep 1"
              className="w-20 border-none bg-transparent"
              value={newEp}
              onChange={(e) => setNewEp(e.target.value)}
            />
            <Button onClick={handleAdd} disabled={loading} variant="primary">
              {loading ? <Sparkles className="animate-spin" size={18} /> : <Plus size={18} />}
              <span>Track</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="space-y-8">
        <SectionTitle title="Currently Watching" icon={Play} subtitle="Don't let that backlog grow." />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {watching.map(anime => (
            <Card key={anime.id} hoverEffect className="relative group overflow-hidden">
              {/* Decorative Background for Card */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600"></div>

              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-display font-bold text-xl text-white line-clamp-1">{anime.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="pink">Ep {anime.currentEpisode}</Badge>
                    {anime.rating && (
                      <Badge variant="yellow"><Star size={10} fill="currentColor" /> {anime.rating}</Badge>
                    )}
                  </div>
                </div>

                {/* Rating Input Hidden by default, shown on hover/focus could be cleaner but kept simple here */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg p-1 backdrop-blur-sm">
                  <select
                    className="bg-transparent text-white text-xs outline-none cursor-pointer"
                    value={anime.rating || ''}
                    onChange={(e) => onRateAnime(anime.id, parseInt(e.target.value))}
                  >
                    <option value="">Rate</option>
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              {/* Arc Info */}
              <div className="bg-zinc-900/50 rounded-xl p-4 mb-6 border border-white/5">
                <div className="flex items-center gap-2 text-pink-300 text-xs font-bold uppercase tracking-wider mb-2">
                  <BrainCircuit size={14} />
                  Current Arc
                </div>
                <div className="text-white font-medium mb-1 flex items-center gap-2">
                  {anime.currentArc || 'Unknown Arc'}
                  {(!anime.currentArc || anime.currentArc === 'Unknown Arc') && (
                    <button
                      onClick={() => onRefreshArc(anime.id)}
                      className="p-1 hover:bg-white/10 rounded-full transition-colors text-pink-400 hover:text-pink-300"
                      title="Retry Arc Detection"
                    >
                      <Zap size={12} className="fill-current" />
                    </button>
                  )}
                </div>
                {anime.episodesToArcEnd !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-zinc-500">
                      <span>Progress to Finale</span>
                      <span>{anime.episodesToArcEnd} eps left</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-1000 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        style={{ width: `${Math.max(5, 100 - (anime.episodesToArcEnd * 5))}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => onUpdateAnime(anime.id, anime.currentEpisode + 1)}
                  className="flex-1 py-2 text-sm"
                  variant="primary"
                >
                  <Plus size={16} /> Episode {anime.currentEpisode + 1}
                </Button>
                <button
                  onClick={() => attemptHold(anime.title)}
                  className="p-2.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                  title="Put on hold"
                >
                  <Calendar size={18} />
                </button>
              </div>
            </Card>
          ))}

          {watching.length === 0 && (
            <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded-3xl bg-zinc-900/20">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-600">
                <Tv size={32} />
              </div>
              <h3 className="text-zinc-400 font-medium">No active anime. Start something new above!</h3>
            </div>
          )}
        </div>
      </div>

      {/* Motivational Modal */}
      {showHoldWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-pink-500 p-8 rounded-3xl max-w-md w-full text-center relative shadow-[0_0_100px_rgba(236,72,153,0.4)]">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-pink-500/40">
              <Zap className="text-white" size={40} />
            </div>
            <h3 className="text-2xl font-display font-bold text-white mb-2">Chotto matte!</h3>
            <p className="text-lg text-pink-200 mb-8 italic font-light">"{showHoldWarning}"</p>
            <div className="flex gap-3">
              <Button onClick={() => setShowHoldWarning(null)} className="w-full">
                I'll keep watching!
              </Button>
              <Button onClick={() => setShowHoldWarning(null)} variant="ghost" className="w-full">
                Fine...
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PredictorView = ({ userProfile }: { userProfile: UserProfile }) => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<{ probability: number, reason: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!query) return;
    setLoading(true);
    const res = await getCompletionProbability(query, userProfile.likes);
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto py-10 animate-in slide-in-from-bottom-8 duration-700">
      <div className="text-center space-y-4 mb-12">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 mb-4 border border-indigo-500/20">
          <BrainCircuit size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white">Will You Finish It?</h1>
        <p className="text-lg text-zinc-400 max-w-lg mx-auto leading-relaxed">
          The Oracle AI analyzes your taste profile against pacing, genre, and length to predict your destiny.
        </p>
      </div>

      <div className="glass-card p-2 rounded-2xl flex flex-col md:flex-row gap-2 mb-12">
        <Input
          placeholder="Enter an anime title..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="bg-transparent border-none text-lg px-6 h-14"
        />
        <Button onClick={handlePredict} disabled={loading} className="px-10 h-14 rounded-xl text-lg">
          {loading ? 'Consulting Oracle...' : 'Predict Destiny'}
        </Button>
      </div>

      {result && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
          <Card className="relative text-center py-16 px-8 bg-zinc-900 border-pink-500/30">
            <div className="mb-6 text-zinc-500 uppercase tracking-[0.2em] text-xs font-bold">Completion Probability</div>

            <div className="relative inline-block">
              <div className="text-8xl md:text-9xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-8 relative z-10">
                {result.probability}%
              </div>
              {/* Glow behind number */}
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full blur-[60px] opacity-40 rounded-full ${result.probability > 50 ? 'bg-green-500' : 'bg-red-500'}`}></div>
            </div>

            <p className="text-2xl text-white font-light italic leading-relaxed max-w-xl mx-auto">
              "{result.reason}"
            </p>

            <div className="mt-12 h-1 w-32 mx-auto bg-zinc-800 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-1000 ${result.probability > 50 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{ width: `${result.probability}%` }}
              ></div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

const ProfileView = ({
  userProfile,
  animeList,
  onUpdateProfile
}: {
  userProfile: UserProfile,
  animeList: Anime[],
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

  const handleMove = (item: string, from: 'likes' | 'dislikes' | 'unrated', to: 'likes' | 'dislikes') => {
    const updates: Partial<UserProfile> = {};

    // Remove from source
    if (from === 'likes') updates.likes = userProfile.likes.filter(i => i !== item);
    if (from === 'dislikes') updates.dislikes = userProfile.dislikes.filter(i => i !== item);
    // Note: 'unrated' logic is implicit; we don't remove anime from the main list here, just add to preferences.

    // Add to target
    if (to === 'likes') {
      const existing = updates.likes || userProfile.likes;
      if (!existing.includes(item)) updates.likes = [...existing, item];
    }
    if (to === 'dislikes') {
      const existing = updates.dislikes || userProfile.dislikes;
      if (!existing.includes(item)) updates.dislikes = [...existing, item];
    }

    onUpdateProfile(updates);
  };

  const removePreference = (item: string, type: 'likes' | 'dislikes') => {
    onUpdateProfile({
      [type]: userProfile[type].filter(i => i !== item)
    });
  };

  // Dynamic Data Calculation
  const unratedAnime = animeList.filter(a => !a.rating || a.rating === 0);

  const chartData = [
    { name: 'Watching', value: animeList.filter(a => a.status === AnimeStatus.WATCHING).length },
    { name: 'Completed', value: animeList.filter(a => a.status === AnimeStatus.COMPLETED).length },
    { name: 'Plan to Watch', value: animeList.filter(a => a.status === AnimeStatus.PLAN_TO_WATCH).length },
    { name: 'Dropped', value: animeList.filter(a => a.status === AnimeStatus.DROPPED).length },
  ];

  return (
    <div className="space-y-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-8">
          <SectionTitle title="Taste Profile" icon={Brain} subtitle="Teach the AI what makes you tick." />

          <div className="grid gap-6">
            {/* Likes */}
            <Card className="border-green-500/20 bg-green-950/5">
              <h3 className="font-bold text-green-400 mb-4 flex items-center gap-2"><Check size={18} /> I Love</h3>
              <div className="flex gap-3 mb-6">
                <Input
                  value={inputLike}
                  onChange={(e) => setInputLike(e.target.value)}
                  placeholder="e.g. Attack on Titan"
                  className="bg-black/40 border-green-500/20 focus:border-green-500"
                />
                <Button onClick={addLike} variant="secondary" className="bg-green-500/10 text-green-400 hover:bg-green-500/20"><Plus size={18} /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.likes.map(like => (
                  <Badge key={like} variant="green">
                    {like}
                    <div className="ml-2 pl-2 border-l border-green-500/30 flex gap-1">
                      <button onClick={() => handleMove(like, 'likes', 'dislikes')} className="hover:text-red-400" title="Move to Hates"><X size={12} /></button>
                      <button onClick={() => removePreference(like, 'likes')} className="hover:text-white" title="Remove"><div className="rotate-45"><Plus size={12} /></div></button>
                    </div>
                  </Badge>
                ))}
                {userProfile.likes.length === 0 && <span className="text-zinc-600 text-sm italic">Nothing here yet...</span>}
              </div>
            </Card>

            {/* Dislikes */}
            <Card className="border-red-500/20 bg-red-950/5">
              <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2"><X size={18} /> I Hate</h3>
              <div className="flex gap-3 mb-6">
                <Input
                  value={inputDislike}
                  onChange={(e) => setInputDislike(e.target.value)}
                  placeholder="e.g. Fillers"
                  className="bg-black/40 border-red-500/20 focus:border-red-500"
                />
                <Button onClick={addDislike} variant="secondary" className="bg-red-500/10 text-red-400 hover:bg-red-500/20"><Plus size={18} /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {userProfile.dislikes.map(dislike => (
                  <Badge key={dislike} variant="pink">
                    {dislike}
                    <div className="ml-2 pl-2 border-l border-red-500/30 flex gap-1">
                      <button onClick={() => handleMove(dislike, 'dislikes', 'likes')} className="hover:text-green-400" title="Move to Loves"><Check size={12} /></button>
                      <button onClick={() => removePreference(dislike, 'dislikes')} className="hover:text-white" title="Remove"><div className="rotate-45"><Plus size={12} /></div></button>
                    </div>
                  </Badge>
                ))}
                {userProfile.dislikes.length === 0 && <span className="text-zinc-600 text-sm italic">Nothing here yet...</span>}
              </div>
            </Card>
          </div>
          {/* Not Rated / In Progress */}
          <Card className="border-yellow-500/20 bg-yellow-950/5">
            <h3 className="font-bold text-yellow-400 mb-4 flex items-center gap-2"><Star size={18} /> Not Rated Yet</h3>
            <div className="flex flex-wrap gap-2">
              {unratedAnime.length > 0 ? (
                unratedAnime.map(anime => (
                  <Badge key={anime.id} variant="yellow">
                    {anime.title}
                    <div className="ml-2 pl-2 border-l border-yellow-500/30 flex gap-1">
                      <button onClick={() => handleMove(anime.title, 'unrated', 'likes')} className="hover:text-green-400" title="Move to Loves"><Check size={12} /></button>
                      <button onClick={() => handleMove(anime.title, 'unrated', 'dislikes')} className="hover:text-red-400" title="Move to Hates"><X size={12} /></button>
                    </div>
                  </Badge>
                ))
              ) : (
                <span className="text-zinc-600 text-sm italic">All your anime are rated!</span>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="space-y-8">
        <SectionTitle title="Analytics" icon={TrendingUp} />
        <Card className="h-96 flex flex-col justify-center bg-zinc-900/50">
          <h3 className="text-center text-zinc-400 mb-6 font-display font-medium">Watch Status Distribution</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff', borderRadius: '12px' }}
                itemStyle={{ color: '#ec4899' }}
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
              />
              <Bar dataKey="value" fill="#ec4899" radius={[6, 6, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

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
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-end justify-between gap-6 pb-8 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Discovery Engine</h1>
          <p className="text-zinc-400">AI-curated picks based on your watch history.</p>
        </div>
        <Button onClick={fetchRecs} disabled={loading} className="px-8">
          {loading ? <Sparkles className="animate-spin" /> : <Sparkles />}
          Generate Picks
        </Button>
      </div>

      {recommendations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec, i) => (
            <Card key={i} hoverEffect className="flex flex-col h-full border-pink-500/10">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-white">{rec.title}</h3>
                  <Badge variant="pink">{rec.matchScore}% Match</Badge>
                </div>
                <div className="p-4 bg-zinc-900/50 rounded-xl mb-4 border border-white/5">
                  <p className="text-zinc-300 text-sm leading-relaxed italic">"{rec.reason}"</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full text-sm mt-4">Add to Plan to Watch</Button>
            </Card>
          ))}
        </div>
      ) : (
        !loading && (
          <div className="text-center py-24 glass-card rounded-3xl border-dashed border-zinc-800">
            <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-600">
              <Sparkles size={40} />
            </div>
            <h3 className="text-xl text-white font-medium mb-2">Ready to explore?</h3>
            <p className="text-zinc-500">Click the button above to analyze your viewing matrix.</p>
          </div>
        )
      )}
    </div>
  );
};


// --- MAIN APP ---
const App: React.FC = () => {
  const [user, setUser] = useState<any | null>(null);
  const [currentView, setView] = useState<ViewState>(ViewState.AUTH);
  const [authError, setAuthError] = useState<string | null>(null);
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    username: 'Guest',
    likes: [],
    dislikes: []
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (firebaseUser) {
        // Enforce status check
        const status = await getUserStatus(firebaseUser.uid);
        if (status === 'active') {
          setUser(firebaseUser);
          setAuthError(null);
          setView(prev => prev === ViewState.AUTH ? ViewState.DASHBOARD : prev);
        } else {
          console.warn(`User ${firebaseUser.uid} has status ${status}. Logging out.`);
          await logoutUser();
          setUser(null);
          setAuthError(status === 'pending_activation' ? "Pending Admin Approval" : "Access denied.");
          setView(ViewState.AUTH);
        }
      } else {
        setUser(null);
        setView(prev => prev !== ViewState.PRIVACY_POLICY ? ViewState.AUTH : prev);
        setAnimeList(SAMPLE_ANIME);
        setUserProfile({
          username: 'Guest',
          likes: [],
          dislikes: []
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubAnime = subscribeToAnimeList(user.uid, setAnimeList);
    const unsubProfile = subscribeToProfile(user.uid, setUserProfile);
    return () => { unsubAnime(); unsubProfile(); };
  }, [user]);

  const handleUpdateAnime = async (id: string, newEpisode: number) => {
    const currentAnime = animeList.find(a => a.id === id);
    if (!currentAnime) return;

    let newArcEps = currentAnime.episodesToArcEnd ? currentAnime.episodesToArcEnd - 1 : undefined;
    const newStatus = (currentAnime.totalEpisodes && newEpisode >= currentAnime.totalEpisodes) ? AnimeStatus.COMPLETED : currentAnime.status;
    let newArcName = currentAnime.currentArc;

    if (newArcEps !== undefined && newArcEps <= 0) {
      try {
        const info = await getAnimeArcInfo(currentAnime.title, newEpisode);
        newArcEps = info.episodesToArcEnd;
        newArcName = info.currentArc;
      } catch (e) {
        newArcEps = 0;
      }
    }

    const updated = {
      ...currentAnime,
      currentEpisode: newEpisode,
      episodesToArcEnd: newArcEps,
      currentArc: newArcName,
      status: newStatus
    };

    if (user) await saveAnimeToFirestore(user.uid, updated);
    else setAnimeList(prev => prev.map(a => a.id === id ? updated : a));
  };

  const handleRefreshArc = async (id: string) => {
    const currentAnime = animeList.find(a => a.id === id);
    if (!currentAnime) return;

    try {
      const info = await getAnimeArcInfo(currentAnime.title, currentAnime.currentEpisode);
      if (info) {
        const updated = {
          ...currentAnime,
          currentArc: info.currentArc,
          episodesToArcEnd: info.episodesToArcEnd,
          totalEpisodes: info.totalEpisodes
        };

        if (user) await saveAnimeToFirestore(user.uid, updated);
        else setAnimeList(prev => prev.map(a => a.id === id ? updated : a));
      }
    } catch (e) {
      console.error("Failed to refresh arc", e);
    }
  };

  const handleRateAnime = async (id: string, rating: number) => {
    if (user) {
      const currentAnime = animeList.find(a => a.id === id);
      if (currentAnime) await saveAnimeToFirestore(user.uid, { ...currentAnime, rating });
    } else {
      setAnimeList(prev => prev.map(a => a.id === id ? { ...a, rating } : a));
    }
  };

  const handleAddAnime = async (title: string, currentEpisode: number) => {
    const tempId = Date.now().toString();
    const newAnime: Anime = { id: tempId, title, currentEpisode, status: AnimeStatus.WATCHING };

    if (!user) setAnimeList(prev => [newAnime, ...prev]);

    try {
      // 1. Save immediately with basic info (Optimistic UI) called above if guest, but let's standardize.
      // We'll update the 'user' flow to also save immediately or wait.
      // Actually, standardizing:

      let enrichedAnime = { ...newAnime };

      // 2. Try Gemini
      const info = await getAnimeArcInfo(title, currentEpisode);

      if (info) {
        // SUCCESS
        enrichedAnime = {
          ...enrichedAnime,
          title: info.correctTitle || title, // Use canonical title if available
          currentArc: info.currentArc,
          episodesToArcEnd: info.episodesToArcEnd,
          totalEpisodes: info.totalEpisodes,
          pendingLookup: false
        };
      } else {
        // FAILURE / RETRY LATER
        console.warn("Gemini lookup failed, marking for retry.");
        enrichedAnime = {
          ...enrichedAnime,
          currentArc: "Unknown (Lookup Pending)",
          episodesToArcEnd: 0,
          pendingLookup: true
        };
      }

      // 3. Save Final State
      if (user) {
        await saveAnimeToFirestore(user.uid, enrichedAnime);
        // If we optimistically added to local state earlier for guest, we don't need to do anything else.
        // But for logged in user, we should ensure the list updates. 
        // Since we subscribe, writing to Firestore is enough.
      } else {
        // Guest mode
        setAnimeList(prev => prev.map(a => a.id === tempId ? enrichedAnime : a));
      }

    } catch (e) {
      console.error("Error adding anime:", e);
      // Fallback save if completely broken
      if (user) await saveAnimeToFirestore(user.uid, newAnime);
    }
  };

  const handleUpdateProfile = async (updates: Partial<UserProfile>) => {
    if (user) await updateUserProfileFirestore(user.uid, updates);
    else setUserProfile(prev => ({ ...prev, ...updates }));
  }

  if (currentView === ViewState.PRIVACY_POLICY) {
    return <PrivacyPolicy onBack={() => setView(user ? ViewState.DASHBOARD : ViewState.AUTH)} />;
  }

  if (currentView === ViewState.AUTH) {
    return <AuthView onLogin={() => { }} onViewPrivacy={() => setView(ViewState.PRIVACY_POLICY)} initialError={authError} />;
  }

  return (
    <Layout
      currentView={currentView}
      setView={setView}
      onLogout={() => { logoutUser(); setView(ViewState.AUTH); }}
      isGuest={!user}
    >
      {currentView === ViewState.DASHBOARD && (
        <DashboardView
          animeList={animeList}
          onUpdateAnime={handleUpdateAnime}
          onAddAnime={handleAddAnime}
          onRateAnime={handleRateAnime}
          onRefreshArc={handleRefreshArc}
          userProfile={userProfile}
        />
      )}
      {currentView === ViewState.PREDICTOR && (
        <PredictorView userProfile={userProfile} />
      )}
      {currentView === ViewState.PROFILE && (
        <ProfileView userProfile={userProfile} animeList={animeList} onUpdateProfile={handleUpdateProfile} />
      )}
      {currentView === ViewState.RECOMMENDATIONS && (
        <RecommendationsView animeList={animeList} userProfile={userProfile} />
      )}
    </Layout>
  );
};

export default App;