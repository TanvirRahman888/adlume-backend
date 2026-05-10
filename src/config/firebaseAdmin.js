import dotenv from "dotenv";
import admin from "firebase-admin";

dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId) {
  throw new Error("FIREBASE_PROJECT_ID is missing in .env");
}

if (!clientEmail) {
  throw new Error("FIREBASE_CLIENT_EMAIL is missing in .env");
}

if (!privateKey) {
  throw new Error("FIREBASE_PRIVATE_KEY is missing in .env");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });
}

export default admin;