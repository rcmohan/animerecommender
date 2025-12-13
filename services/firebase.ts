import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword as firebaseCreateUser,
  signInWithEmailAndPassword as firebaseSignIn,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  onSnapshot,
  collection
} from "firebase/firestore";
import { Anime, UserProfile } from "../types";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "anipink-app.firebaseapp.com",
  projectId: "anipink-app",
  storageBucket: "anipink-app.firebasestorage.app",
  messagingSenderId: "944523240658",
  appId: "1:944523240658:web:0094b1016563278d20790b",
  measurementId: "G-ES6WS9RW3B"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const db = getFirestore(app);

// --- TYPES ---
export type User = FirebaseUser;

// --- AUTH SERVICES ---

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logoutUser = async () => {
  await signOut(auth);
};

export {
  firebaseCreateUser as createUserWithEmailAndPassword,
  firebaseSignIn as signInWithEmailAndPassword
};

// --- DATA SERVICES ---

// Helper to get ID token
const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return await user.getIdToken();
};

export const initializeUserDoc = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid, "profile", "main");

  try {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      const profile: UserProfile = {
        username: user.email?.split('@')[0] || "AnimeFan",
        status: 'pending_activation',
        likes: [],
        dislikes: [],
        uid: user.uid
      };

      // Use server-side write via our API wrapper
      await updateUserProfileFirestore(user.uid, profile);
    }
  } catch (e) {
    console.error("Error initializing user doc:", e);
  }
};

export const subscribeToAnimeList = (uid: string, callback: (list: Anime[]) => void) => {
  const q = collection(db, "users", uid, "animeList");
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const list: Anime[] = [];
    snapshot.forEach((doc) => {
      list.push(doc.data() as Anime);
    });
    callback(list);
  }, (error) => {
    console.error("Error subscribing to anime list:", error);
    callback([]);
  });
  return unsubscribe;
};

export const subscribeToProfile = (uid: string, callback: (profile: UserProfile) => void) => {
  const docRef = doc(db, "users", uid, "profile", "main");
  const unsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      callback({
        uid,
        username: data.username || 'User',
        likes: data.likes || [],
        dislikes: data.dislikes || [],
        ...data
      } as UserProfile);
    } else {
      callback({
        uid,
        username: 'Guest',
        likes: [],
        dislikes: []
      });
    }
  }, (error) => {
    console.error("Error subscribing to profile:", error);
  });
  return unsubscribe;
};

export const getUserStatus = async (uid: string): Promise<string> => {
  try {
    const userRef = doc(db, "users", uid, "profile", "main");
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as UserProfile;
      return data.status || 'active';
    }
    return 'pending_activation';
  } catch (error) {
    console.error("Error getting user status:", error);
    return 'error';
  }
};

// --- SERVER-SIDE WRITES ---

export const saveAnimeToFirestore = async (uid: string, anime: Anime) => {
  if (!uid || !anime.id) return;

  const token = await getIdToken();
  if (!token) {
    console.error("No auth token available for write");
    return;
  }

  try {
    const response = await fetch('/api/anime', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ uid, anime })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }
  } catch (e) {
    console.error("Failed to save anime via server:", e);
  }
};

export const updateUserProfileFirestore = async (uid: string, updates: Partial<UserProfile>) => {
  const token = await getIdToken();
  if (!token) return;

  try {
    const response = await fetch('/api/profile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ uid, updates })
    });
    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }
  } catch (e) {
    console.error("Failed to update profile via server:", e);
  }
};