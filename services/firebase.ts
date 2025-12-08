
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
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  updateDoc
} from "firebase/firestore";
import { Anime, UserProfile } from "../types";

// --- CONFIGURATION ---
// TODO: Replace with your actual Firebase project configuration

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
// Re-export or define User type to match usage in App
export type User = FirebaseUser;

// --- AUTH SERVICES ---

export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logoutUser = async () => {
  await signOut(auth);
};

// We export these directly as they match the signature (auth, email, password)
export {
  firebaseCreateUser as createUserWithEmailAndPassword,
  firebaseSignIn as signInWithEmailAndPassword
};

// --- DATA SERVICES ---

export const initializeUserDoc = async (user: User) => {
  if (!user) return;
  const userRef = doc(db, "users", user.uid, "profile", "main");

  try {
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      const profile: UserProfile = {
        username: user.email?.split('@')[0] || "AnimeFan",
        likes: [],
        dislikes: [],
        uid: user.uid
      };
      // Use setDoc to create
      await setDoc(userRef, profile);
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
      // Assuming the doc data is the Anime object
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
      callback({ uid, ...docSnap.data() } as UserProfile);
    } else {
      // Fallback if profile doesn't exist yet (should exist if triggered by Auth)
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

export const saveAnimeToFirestore = async (uid: string, anime: Anime) => {
  if (!uid || !anime.id) return;
  const animeRef = doc(db, "users", uid, "animeList", anime.id);
  // Use setDoc with merge to create or update
  await setDoc(animeRef, anime, { merge: true });
};

export const updateUserProfileFirestore = async (uid: string, updates: Partial<UserProfile>) => {
  const profileRef = doc(db, "users", uid, "profile", "main");
  // Use setDoc with merge to safe update even if fields are missing
  await setDoc(profileRef, updates, { merge: true });
};