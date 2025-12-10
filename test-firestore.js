
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Try to load project ID from args or default
const projectId = process.argv[2] || 'anipink-app';

console.log(`Testing connection to Firestore for Project ID: ${projectId}...`);

try {
    initializeApp({
        credential: applicationDefault(),
        projectId: projectId
    });

    const db = getFirestore();

    console.log("Attempting to list collections...");
    const collections = await db.listCollections();

    if (collections.length === 0) {
        console.log("✅ Connection SUCCESSFUL! (No collections found, but access works)");
    } else {
        console.log(`✅ Connection SUCCESSFUL! Found ${collections.length} collections:`);
        collections.forEach(col => console.log(` - ${col.id}`));
    }

} catch (error) {
    console.error("\n❌ CONNECTION FAILED");
    console.error("Error Code:", error.code);
    console.error("Message:", error.message);

    if (error.code === 5 || error.message.includes("NOT_FOUND")) {
        console.log("\nPossible Causes:");
        console.log("1. The Project ID '" + projectId + "' is incorrect.");
        console.log("2. The Firestore Database has not been created in this project.");
        console.log("3. The database is in 'Datastore Mode' (should be Native).");
    }
}
