import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors()); // Allow cross-origin for local dev

// Initialize Firebase Admin
let db;

try {
    if (getApps().length === 0) {
        initializeApp({
            projectId: "anipink-app"
        });
    }
    db = getFirestore();
    console.log("Firebase Admin initialized. Verifying connection...");

    // Quick startup check
    db.listCollections()
        .then(cols => {
            console.log(`✅ Connected to Firestore! Found ${cols.length} root collections.`);
        })
        .catch(err => {
            console.error("❌ Failed to connect to Firestore on startup:", err.message);
            console.error("   (Code: " + err.code + ")");
            console.error("   - Check if 'anipink-app' is the correct Project ID.");
            console.error("   - Run 'gcloud auth application-default login'");
        });

} catch (error) {
    console.error("WARNING: Failed to initialize Firebase Admin:", error.message);
    console.error("Server starting in MOCK mode (Writes will fail but UI will load).");
    // We can't use db if init failed.
}

// --- API ROUTES ---

// Middleware to verify auth token (Simplified for now, expecting ID token in header)
const verifyUser = async (req, res, next) => {
    const token = req.headers.authorization?.split('Bearer ')[1];
    if (!token) return res.status(401).send('Unauthorized');
    // TODO: Verify token with Firebase Admin Auth
    next();
};

app.post('/api/anime', async (req, res) => {
    if (!db) return res.status(503).send({ error: 'Server database not connected (Local Dev Mode)' });
    try {
        const { uid, anime } = req.body;
        if (!uid || !anime || !anime.id) {
            return res.status(400).send('Missing data');
        }

        // Secure write server-side
        await db.collection('users').doc(uid).collection('animeList').doc(anime.id).set(anime, { merge: true });

        console.log(`Updated anime ${anime.title} for user ${uid}`);
        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Error writing anime:', error);
        res.status(500).send({ error: error.message });
    }
});

app.post('/api/profile', async (req, res) => {
    if (!db) return res.status(503).send({ error: 'Server database not connected (Local Dev Mode)' });
    try {
        const { uid, updates } = req.body;
        if (!uid || !updates) {
            return res.status(400).send('Missing data');
        }

        await db.collection('users').doc(uid).collection('profile').doc('main').set(updates, { merge: true });

        console.log(`Updated profile for user ${uid}`);
        res.status(200).send({ success: true });
    } catch (error) {
        console.error('Error writing profile:', error);
        res.status(500).send({ error: error.message });
    }
});

// --- SERVE FRONTEND (Production) ---
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Handle client-side routing, return all requests to index.html
// Handle client-side routing, return all requests to index.html
app.get(/.*/, (req, res) => {
    const indexPath = path.join(distPath, 'index.html');
    console.log(`Serving index.html from: ${indexPath} for request: ${req.url}`);
    res.sendFile(indexPath, (err) => {
        if (err) {
            console.error("Error serving index.html:", err);
            res.status(500).send("Error loading application.");
        }
    });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
