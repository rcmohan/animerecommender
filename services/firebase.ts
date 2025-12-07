import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  updateDoc,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { Anime, UserProfile } from "../types";

// --- CONFIGURATION ---
// TODO: Replace with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyDummyKey-ReplaceMe",
  authDomain: "anipink-app.firebaseapp.com",
  projectId: "anipink-app",
  storageBucket: "anipink-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:dummy"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- AUTH SERVICES ---
export const subscribeToAuth = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

export const logoutUser = () => signOut(auth);

// --- DATA SERVICES ---

// Initialize user document after registration
export const initializeUserDoc = async (user: User) => {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      username: user.email?.split('@')[0] || "AnimeFan",
      likes: [],
      dislikes: [],
      createdAt: new Date().toISOString()
    });
  }
};

// Sync Anime List
export const subscribeToAnimeList = (uid: string, callback: (list: Anime[]) => void) => {
  const userRef = doc(db, "users", uid);
  // We store anime as a sub-collection or a field. 
  // For a simple app, a sub-collection 'watch-history' is robust.
  const q = collection(db, "users", uid, "watch-history");
  
  return onSnapshot(q, (snapshot) => {
    const list: Anime[] = [];
    snapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() } as Anime);
    });
    callback(list);
  });
};

// Sync Profile
export const subscribeToProfile = (uid: string, callback: (profile: UserProfile) => void) => {
  const userRef = doc(db, "users", uid);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        uid: doc.id,
        username: data.username,
        likes: data.likes || [],
        dislikes: data.dislikes || []
      });
    }
  });
};

// Actions
export const saveAnimeToFirestore = async (uid: string, anime: Anime) => {
  // Use anime.id as doc ID if it exists, otherwise auto-id (handled by setDoc with merge if we pass ID)
  const docRef = doc(db, "users", uid, "watch-history", anime.id);
  await setDoc(docRef, { ...anime }, { merge: true });
};

export const updateUserProfileFirestore = async (uid: string, updates: Partial<UserProfile>) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, updates);
};
