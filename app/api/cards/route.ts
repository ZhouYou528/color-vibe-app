import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/gcs";
import { createCard, createOrUpdateUser, getUserCards } from "@/lib/db";
import { ColorInfo } from "@/lib/colorAnalysis";
import { InsightData } from "@/lib/mockInsights";
import { GeminiAnalysis } from "@/lib/geminiTypes";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const cards = await getUserCards(userId);

    // Convert Firestore Timestamps to ISO strings for JSON serialization
    const cardsResponse = cards.map((card) => ({
      ...card,
      createdAt: card.createdAt.toDate().toISOString(),
    }));

    return NextResponse.json({ cards: cardsResponse });
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Failed to fetch cards" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    // Create or update user record
    await createOrUpdateUser(userId, {
      name: session.user.name || "",
      email: session.user.email || "",
      picture: session.user.image || undefined,
    });

    // Parse multipart form data
    const formData = await request.formData();
    const payloadStr = formData.get("payload") as string;
    
    if (!payloadStr) {
      return NextResponse.json(
        { error: "Missing payload" },
        { status: 400 }
      );
    }

    const payload = JSON.parse(payloadStr);
    const { title, cardDetails, palette, insights, geminiAnalysis } = payload;

    // Get image files
    const imageFiles: File[] = [];
    let index = 0;
    while (true) {
      const file = formData.get(`preview_${index}`) as File | null;
      if (!file) break;
      imageFiles.push(file);
      index++;
    }

    // If no files found with preview_0, try previews[] array
    if (imageFiles.length === 0) {
      const previews = formData.getAll("previews[]") as File[];
      imageFiles.push(...previews);
    }

    // Generate card ID
    const cardId = `card-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Upload images to GCS
    const imageUrls: string[] = [];
    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const url = await uploadImage(userId, cardId, i, buffer, file.type || "image/webp");
      imageUrls.push(url);
    }

    // Create card in database
    const cardData: any = {
      title,
      cardDetails,
      palette: palette as ColorInfo[],
      insights: insights as InsightData,
      imageUrls,
    };
    
    // Include Gemini analysis if provided
    if (geminiAnalysis) {
      cardData.geminiAnalysis = geminiAnalysis as GeminiAnalysis;
    }
    
    const createdCardId = await createCard(userId, cardData);

    return NextResponse.json(
      { id: createdCardId, title, imageUrls },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating card:", error);
    
    // Better error message extraction
    let errorMessage = "Failed to create card";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      // Handle GCS errors with code/message structure
      const err = error as any;
      if (err.message) {
        errorMessage = err.message;
      } else if (err.code && err.errors && err.errors[0]?.message) {
        errorMessage = `${err.code}: ${err.errors[0].message}`;
      } else {
        errorMessage = JSON.stringify(error);
      }
    } else {
      errorMessage = String(error);
    }
    
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error details:", { errorMessage, errorStack, rawError: error });
    
    return NextResponse.json(
      { 
        error: "Failed to create card",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}
