import { Anime, UserProfile } from "../types";

// Mock User Interface matching Firebase User minimally
export interface User {
  uid: string;
  email: string | null;
}

// Mock Auth State
let currentUser: User | null = null;
let authListener: ((user: User | null) => void) | null = null;

// Simple Event Emitter for Data subscriptions
const listeners: Record<string, ((data: any) => void)[]> = {};

const emitChange = (key: string, data: any) => {
  if (listeners[key]) {
    listeners[key].forEach(cb => cb(data));
  }
};

const subscribe = (key: string, callback: (data: any) => void) => {
  if (!listeners[key]) listeners[key] = [];
  listeners[key].push(callback);
  return () => {
    listeners[key] = listeners[key].filter(cb => cb !== callback);
  };
};

// Initialize state from LocalStorage
const STORAGE_KEY_USER = 'anipink_user';

if (typeof localStorage !== 'undefined') {
  const saved = localStorage.getItem(STORAGE_KEY_USER);
  if (saved) {
    try {
      currentUser = JSON.parse(saved);
    } catch (e) {
      console.error("Failed to parse saved user", e);
    }
  }
}

// Helper to trigger listener
const notifyAuth = () => {
  if (authListener) authListener(currentUser);
};

// Exported Auth Object (Mock)
export const auth = {
  get currentUser() { return currentUser; }
};

// --- AUTH SERVICES ---

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  authListener = callback;
  // Trigger immediately
  setTimeout(() => callback(currentUser), 0);
  return () => { authListener = null; };
};

export const logoutUser = async () => {
  currentUser = null;
  localStorage.removeItem(STORAGE_KEY_USER);
  notifyAuth();
};

export const createUserWithEmailAndPassword = async (_auth: any, email: string, _pass: string) => {
  await new Promise(r => setTimeout(r, 800)); // Simulate network
  const uid = 'user_' + Date.now();
  const user = { uid, email };
  currentUser = user;
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  notifyAuth();
  return { user };
};

export const signInWithEmailAndPassword = async (_auth: any, email: string, _pass: string) => {
  await new Promise(r => setTimeout(r, 800)); // Simulate network
  // Generate a consistent UID for the same email to simulate persistent account
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = ((hash << 5) - hash) + email.charCodeAt(i);
    hash |= 0;
  }
  const uid = 'user_' + Math.abs(hash);
  const user = { uid, email };
  
  currentUser = user;
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  notifyAuth();
  return { user };
};

// --- DATA SERVICES ---

export const initializeUserDoc = async (user: User) => {
  const key = `anipink_profile_${user.uid}`;
  const saved = localStorage.getItem(key);
  if (!saved) {
    const profile: UserProfile = {
      username: user.email?.split('@')[0] || "AnimeFan",
      likes: [],
      dislikes: [],
      uid: user.uid
    };
    localStorage.setItem(key, JSON.stringify(profile));
    // No emit needed yet as no one is subscribed
  }
};

export const subscribeToAnimeList = (uid: string, callback: (list: Anime[]) => void) => {
  const key = `anipink_anime_${uid}`;
  
  const load = () => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  };

  // Initial load
  callback(load());

  // Subscribe to changes
  return subscribe(key, callback);
};

export const subscribeToProfile = (uid: string, callback: (profile: UserProfile) => void) => {
  const key = `anipink_profile_${uid}`;
  
  const load = () => {
    const data = localStorage.getItem(key);
    if (data) {
      return { uid, ...JSON.parse(data) };
    }
    return {
      uid,
      username: 'Guest',
      likes: [],
      dislikes: []
    };
  };

  // Initial load
  callback(load());

  return subscribe(key, callback);
};

export const saveAnimeToFirestore = async (uid: string, anime: Anime) => {
  const key = `anipink_anime_${uid}`;
  const data = localStorage.getItem(key);
  const list: Anime[] = data ? JSON.parse(data) : [];

  const index = list.findIndex(a => a.id === anime.id);
  if (index >= 0) {
    list[index] = { ...list[index], ...anime };
  } else {
    list.push(anime);
  }
  
  localStorage.setItem(key, JSON.stringify(list));
  emitChange(key, list); // Trigger update immediately
};

export const updateUserProfileFirestore = async (uid: string, updates: Partial<UserProfile>) => {
  const key = `anipink_profile_${uid}`;
  const data = localStorage.getItem(key);
  let profile = data ? JSON.parse(data) : { likes: [], dislikes: [] };
  
  profile = { ...profile, ...updates };
  localStorage.setItem(key, JSON.stringify(profile));
  emitChange(key, profile); // Trigger update immediately
};