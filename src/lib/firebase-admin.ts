import "server-only";
import { initializeApp, cert, getApps, App } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// Firebase Admin SDK — SERVER-side reads only. Never import from a client
// component (`import "server-only"` + `serverExternalPackages` enforce that).
//
// IMPORTANT: do NOT import `firebase-admin/auth` here. The Auth subpackage
// pulls in `jwks-rsa` → `jose` (ESM-only), and on Vercel's Node runtime a
// CommonJS `require("jose")` throws ERR_REQUIRE_ESM. This app uses the
// client-side Firebase Auth SDK (see src/context/AuthContext.tsx), so Admin
// Auth is unnecessary — we only need Firestore reads.
//
// LAZY: initialization (and the missing-credentials check) happens on the
// FIRST call to getAdminDb(), NOT at module load, so `next build` can import
// this module without Firebase creds being present.

interface AdminStore {
  app: App;
  db: Firestore;
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
  return { app, db };
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
