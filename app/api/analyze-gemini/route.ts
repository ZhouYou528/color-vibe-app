import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GeminiAnalysis } from "@/lib/geminiTypes";
import { ColorInfo } from "@/lib/colorAnalysis";
import { CardDetails } from "@/lib/db";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set - Gemini analysis will be unavailable");
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const payloadStr = formData.get("payload") as string;

    if (!payloadStr) {
      return NextResponse.json({ error: "Missing payload" }, { status: 400 });
    }

    const payload = JSON.parse(payloadStr);
    const { palette, cardDetails }: { palette: ColorInfo[]; cardDetails: CardDetails } = payload;

    // Collect image files
    const imageFiles: File[] = [];
    let index = 0;
    while (true) {
      const file = formData.get(`preview_${index}`) as File | null;
      if (!file) break;
      imageFiles.push(file);
      index++;
    }

    if (imageFiles.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    // Convert images to base64 for Gemini
    const imageParts = await Promise.all(
      imageFiles.map(async (file) => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString("base64");
        return {
          inlineData: {
            data: base64,
            mimeType: file.type || "image/webp",
          },
        };
      })
    );

    // Build prompt for Gemini
    const paletteText = palette
      .map((c, i) => `${i + 1}. ${c.hex} (${c.label})`)
      .join("\n");

    const tagsText = [
      ...cardDetails.lightTags.map((t) => `Light: ${t}`),
      ...cardDetails.moodTags.map((t) => `Mood: ${t}`),
      ...cardDetails.sceneTags.map((t) => `Scene: ${t}`),
    ].join(", ");

    const prompt = `You are an expert wedding and event design consultant. Analyze the attached inspiration images along with the provided color palette and design tags. 

**Context:**
- Target users: Wedding design professionals and couples planning their own weddings
- Goal: Generate professional, actionable design insights in designer/client language (not technical RGB values)
- Use aesthetic language that creates consensus and inspires creativity

**Color Palette:**
${paletteText}

**Design Tags:**
${tagsText}

**Card Title:** ${cardDetails.title || "Untitled"}

**Notes:** ${cardDetails.notes || "None"}

**Your Task:**
Analyze the images and provide insights in the following JSON format. Respond ONLY with valid JSON, no markdown, no code blocks:

{
  "colorLanguage": "Aesthetic description of the color story in designer language, formatted as bullet points (one per line, each starting with '- '). Avoid RGB values. Example format:\n- Soft blush and champagne tones\n- Ethereal, romantic atmosphere\n- Delicate pastel harmony",
  "compositionLighting": "Guidance on composition and lighting logic formatted as bullet points (one per line, each starting with '- '). Include warm/cool ratio, brightness range, contrast tendency. Provide guidance, not rigid rules. Example format:\n- Warm golden hour lighting dominates\n- 70% warm tones with soft shadows\n- Gentle contrast throughout",
  "wardrobeSuggestions": "Wardrobe recommendations in designer/client language, formatted as bullet points (one per line, each starting with '- '). Use terms that designers and clients understand. Example format:\n- Cream tones and cool white\n- Wheat and soft blush accents\n- Elegant neutral palette",
  "styleKeywords": ["clean skin tone", "moody", "high contrast", "airy", "romantic", "editorial"]
}

Important: 
- For colorLanguage, compositionLighting, and wardrobeSuggestions: Format as bullet points with each point on a new line starting with '- '
- Return ONLY the JSON object, no other text.`;

    // Initialize Gemini - using gemini-2.5-flash only (free tier)
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Call Gemini with images and prompt
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            ...imageParts,
            { text: prompt },
          ],
        },
      ],
    });

    const response = result.response;
    const text = response.text();

    // Parse JSON from response (may be wrapped in markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith("```json")) {
      jsonText = jsonText.replace(/^```json\s*/, "").replace(/\s*```$/, "");
    } else if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/^```\s*/, "").replace(/\s*```$/, "");
    }

    let geminiAnalysis: GeminiAnalysis;
    try {
      geminiAnalysis = JSON.parse(jsonText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", text);
      return NextResponse.json(
        { error: "Failed to parse AI response", details: text.substring(0, 200) },
        { status: 502 }
      );
    }

    // Validate required fields
    if (!geminiAnalysis.styleKeywords || !Array.isArray(geminiAnalysis.styleKeywords)) {
      geminiAnalysis.styleKeywords = [];
    }

    return NextResponse.json({ geminiAnalysis });
  } catch (error: any) {
    console.error("Error calling Gemini API:", error);

    // Handle rate limiting
    if (error.status === 429 || error.message?.includes("429") || error.message?.includes("rate limit")) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please try again later." },
        { status: 429 }
      );
    }

    // Handle other API errors
    if (error.status) {
      return NextResponse.json(
        { error: "Gemini API error", details: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Failed to analyze with Gemini", details: error.message },
      { status: 500 }
    );
  }
}
