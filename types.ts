export enum ViewState {
  AUTH = 'AUTH',
  DASHBOARD = 'DASHBOARD',
  PREDICTOR = 'PREDICTOR',
  PROFILE = 'PROFILE',
  RECOMMENDATIONS = 'RECOMMENDATIONS',
  PRIVACY_POLICY = 'PRIVACY_POLICY'
}

export enum AnimeStatus {
  WATCHING = 'Watching',
  COMPLETED = 'Completed',
  PLAN_TO_WATCH = 'Plan to Watch',
  DROPPED = 'Dropped',
  // Note: "On Hold" is intentionally difficult to select based on requirements
}

export interface Anime {
  id: string;
  title: string;
  currentEpisode: number;
  totalEpisodes?: number; // Optional if ongoing
  status: AnimeStatus;
  coverImage?: string; // URL
  rating?: number; // 1-10
  currentArc?: string;
  episodesToArcEnd?: number;
}

export interface UserProfile {
  uid?: string; // Added for Firebase mapping
  username: string;
  likes: string[];
  dislikes: string[];
}

export interface Recommendation {
  title: string;
  reason: string;
  matchScore: number; // 0-100
}