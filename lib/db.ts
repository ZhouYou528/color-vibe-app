import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { ColorInfo } from "./colorAnalysis";
import { InsightData } from "./mockInsights";
import { GeminiAnalysis } from "./geminiTypes";

// Initialize Firebase Admin
if (!getApps().length) {
  // Supports multiple authentication methods:
  // 1. GOOGLE_APPLICATION_CREDENTIALS env var (path to JSON file)
  // 2. GCP_SERVICE_ACCOUNT_KEY env var (inline JSON string)
  // 3. Application Default Credentials (ADC) - if neither is set
  //    This is the recommended approach when service account key creation is disabled
  let credential;
  
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Path to JSON file - Firebase Admin will read it automatically
    // Don't pass credential, let SDK use env var
    credential = undefined;
  } else if (process.env.GCP_SERVICE_ACCOUNT_KEY) {
    // Inline JSON string
    try {
      const keyData = JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY);
      credential = cert(keyData);
    } catch (e) {
      console.error("Failed to parse GCP_SERVICE_ACCOUNT_KEY", e);
      // Fall back to ADC
      credential = undefined;
    }
  } else {
    // No explicit credentials - use Application Default Credentials
    // This works with: gcloud auth application-default login
    // Firebase Admin will automatically use ADC if no credential is provided
    credential = undefined;
  }

  try {
    if (credential) {
      initializeApp({
        credential: credential,
        projectId: process.env.GCP_PROJECT_ID,
      });
    } else {
      // No explicit credential - Firebase Admin will use ADC automatically
      initializeApp({
        projectId: process.env.GCP_PROJECT_ID,
      });
    }
  } catch (error) {
    console.error("Failed to initialize Firebase Admin:", error);
    throw error;
  }
}

// Use the named database "color-vibe" if specified, otherwise use default
// If your database is the default one, change this to: getFirestore()
const databaseId = process.env.FIRESTORE_DATABASE_ID || "color-vibe";
const db = databaseId ? getFirestore(databaseId) : getFirestore();

export interface CardDetails {
  title: string;
  lightTags: string[];
  moodTags: string[];
  sceneTags: string[];
  notes: string;
}

export interface Card {
  id: string;
  userId: string;
  title: string;
  createdAt: Timestamp;
  cardDetails: CardDetails;
  palette: ColorInfo[];
  insights: InsightData;
  imageUrls: string[];
  geminiAnalysis?: GeminiAnalysis; // Optional AI analysis from Gemini
}

export async function createCard(
  userId: string,
  data: {
    title: string;
    cardDetails: CardDetails;
    palette: ColorInfo[];
    insights: InsightData;
    imageUrls: string[];
    geminiAnalysis?: GeminiAnalysis;
  }
): Promise<string> {
  const cardRef = db.collection("cards").doc();
  const cardId = cardRef.id;

  const cardData: any = {
    userId,
    title: data.title,
    createdAt: Timestamp.now(),
    cardDetails: data.cardDetails,
    palette: data.palette,
    insights: data.insights,
    imageUrls: data.imageUrls,
  };

  // Only include geminiAnalysis if provided
  if (data.geminiAnalysis) {
    cardData.geminiAnalysis = data.geminiAnalysis;
  }

  await cardRef.set(cardData);

  return cardId;
}

export async function getUserCards(userId: string): Promise<Card[]> {
  // Query cards by userId, then sort in memory to avoid needing a composite index
  const cardsSnapshot = await db
    .collection("cards")
    .where("userId", "==", userId)
    .get();

  // Sort by createdAt in descending order (newest first)
  const cards = cardsSnapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Card, "id">),
    }))
    .sort((a, b) => {
      // Sort by createdAt timestamp (newest first)
      const aTime = a.createdAt.toMillis();
      const bTime = b.createdAt.toMillis();
      return bTime - aTime;
    });

  return cards;
}

export async function getCard(cardId: string, userId: string): Promise<Card | null> {
  const cardDoc = await db.collection("cards").doc(cardId).get();

  if (!cardDoc.exists) {
    return null;
  }

  const cardData = cardDoc.data() as Omit<Card, "id">;

  // Verify ownership
  if (cardData.userId !== userId) {
    return null;
  }

  return {
    id: cardDoc.id,
    ...cardData,
  };
}

export async function deleteCard(cardId: string, userId: string): Promise<boolean> {
  const cardDoc = await db.collection("cards").doc(cardId).get();

  if (!cardDoc.exists) {
    return false;
  }

  const cardData = cardDoc.data() as Omit<Card, "id">;

  // Verify ownership
  if (cardData.userId !== userId) {
    return false;
  }

  await cardDoc.ref.delete();
  return true;
}

export async function createOrUpdateUser(
  userId: string,
  data: {
    name: string;
    email: string;
    picture?: string;
  }
): Promise<void> {
  const userRef = db.collection("users").doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    await userRef.set({
      id: userId,
      name: data.name,
      email: data.email,
      picture: data.picture || null,
      createdAt: Timestamp.now(),
    });
  } else {
    // Update existing user
    await userRef.update({
      name: data.name,
      email: data.email,
      picture: data.picture || null,
    });
  }
}
