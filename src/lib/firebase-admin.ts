import "server-only";
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getAuth, Auth } from "firebase-admin/auth";

// Firebase Admin SDK — SERVER-side reads only. Never import from a client
// component (`import "server-only"` + `serverExternalPackages` enforce that).
//
// LAZY: initialization (and the missing-credentials check) happens on the
// FIRST call to getAdminDb()/getAdminAuth(), NOT at module load. This lets
// `next build` import these modules during page-data collection without
// requiring Firebase credentials to be present at build time. At request
// time the first query triggers init; if creds are missing it throws a
// clear error.

interface AdminStore {
  app: App;
  db: Firestore;
  auth: Auth;
}

const globalForAdmin = globalThis as unknown as { _firebaseAdmin?: AdminStore };

function createStore(): AdminStore {
  const projectId =
    process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  // Vercel / .env.local store the key with literal "\n"; restore real newlines
  // or credential.cert() throws "Failed to parse private key".
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env vars. Set FIREBASE_PROJECT_ID (or NEXT_PUBLIC_FIREBASE_PROJECT_ID), " +
        "FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in your environment (.env.local locally, " +
        "Vercel project settings in production)."
    );
  }

  const app = getApps().length
    ? getApps()[0]
    : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore(app);
  db.settings({ ignoreUndefinedProperties: true });
  const auth = getAuth(app);
  return { app, db, auth };
}

function getStore(): AdminStore {
  // HMR-safe singleton: reuse the instance across `next dev` hot reloads.
  if (!globalForAdmin._firebaseAdmin) {
    globalForAdmin._firebaseAdmin = createStore();
  }
  return globalForAdmin._firebaseAdmin;
}

export function getAdminDb(): Firestore {
  return getStore().db;
}

export function getAdminAuth(): Auth {
  return getStore().auth;
}
