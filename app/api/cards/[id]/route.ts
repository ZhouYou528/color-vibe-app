import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCard, deleteCard } from "@/lib/db";
import { deleteCardImages } from "@/lib/gcs";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const cardId = params.id;
    const card = await getCard(cardId, userId);

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Convert Firestore Timestamp to ISO string for JSON serialization
    const cardResponse = {
      ...card,
      createdAt: card.createdAt.toDate().toISOString(),
    };

    return NextResponse.json(cardResponse);
  } catch (error) {
    console.error("Error fetching card:", error);
    return NextResponse.json(
      { error: "Failed to fetch card" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email;
    if (!userId) {
      return NextResponse.json({ error: "User ID not found" }, { status: 400 });
    }

    const cardId = params.id;
    const deleted = await deleteCard(cardId, userId);

    if (!deleted) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    // Delete images from GCS
    try {
      await deleteCardImages(userId, cardId);
    } catch (error) {
      console.error("Error deleting images from GCS:", error);
      // Continue even if image deletion fails
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
