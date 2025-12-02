import { NextRequest, NextResponse } from "next/server";
import {
  getAnthropicClient,
  getGeminiClient,
  generatePeopleWithGemini,
  CATEGORY_GENERATION_SYSTEM_PROMPT,
  buildGenerationPrompt,
} from "@/lib/ai";
import type { Person, Gender } from "@/types";

interface GenerateRequest {
  prompt: string;
  count?: number;
  genderFilter?: Gender[];
  ageRange?: [number, number];
}

interface GeneratedPerson {
  name: string;
  gender: "male" | "female" | "other";
  birthYear: number;
  reason?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { prompt, count = 30, genderFilter, ageRange } = body;

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Please provide a category description" },
        { status: 400 }
      );
    }

    let generatedPeople: GeneratedPerson[];
    let provider: "gemini" | "anthropic";

    // Try Gemini with Google Search grounding first (better for real-time info)
    const geminiClient = getGeminiClient();
    if (geminiClient) {
      try {
        console.log("Using Gemini with Google Search grounding...");
        generatedPeople = await generatePeopleWithGemini(
          prompt,
          count,
          genderFilter,
          ageRange
        );
        provider = "gemini";
        console.log(`Gemini generated ${generatedPeople.length} people`);
      } catch (geminiError) {
        console.error("Gemini generation failed, falling back to Claude:", geminiError);
        // Fall through to Claude
        generatedPeople = await generateWithClaude(prompt, count, genderFilter, ageRange);
        provider = "anthropic";
      }
    } else {
      // Use Claude as fallback
      console.log("Gemini not configured, using Claude...");
      generatedPeople = await generateWithClaude(prompt, count, genderFilter, ageRange);
      provider = "anthropic";
    }

    // Convert to Person format
    const categoryId = `custom-${Date.now()}`;
    const people: Person[] = generatedPeople.map((p, index) => ({
      id: `${categoryId}-${index}`,
      name: p.name,
      gender: p.gender,
      birthYear: p.birthYear,
      categoryId,
    }));

    return NextResponse.json({
      success: true,
      categoryId,
      categoryName: prompt,
      people,
      provider,
      rawResponse: generatedPeople,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    if (errorMessage.includes("API_KEY")) {
      return NextResponse.json(
        { error: "AI service not configured. Please set GOOGLE_AI_API_KEY or ANTHROPIC_API_KEY." },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: `Failed to generate category: ${errorMessage}` },
      { status: 500 }
    );
  }
}

/**
 * Generate people using Claude (fallback)
 */
async function generateWithClaude(
  prompt: string,
  count: number,
  genderFilter?: Gender[],
  ageRange?: [number, number]
): Promise<GeneratedPerson[]> {
  const client = getAnthropicClient();
  const userPrompt = buildGenerationPrompt(prompt, count, genderFilter, ageRange);

  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4096,
    system: CATEGORY_GENERATION_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
  });

  // Extract text content
  const textContent = message.content.find((c) => c.type === "text");
  if (!textContent || textContent.type !== "text") {
    throw new Error("No text response from Claude");
  }

  // Parse JSON response
  const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Claude response:", textContent.text);
    throw new Error("No JSON array found in Claude response");
  }

  return JSON.parse(jsonMatch[0]);
}
