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
  const debugLog: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    debugLog.push(`${new Date().toISOString()}: ${msg}`);
  };

  try {
    const body: GenerateRequest = await request.json();
    const { prompt, count = 30, genderFilter, ageRange } = body;

    log(`[API] Received request for: "${prompt}" (count: ${count})`);

    if (!prompt || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: "Please provide a category description", debug: debugLog },
        { status: 400 }
      );
    }

    let generatedPeople: GeneratedPerson[];
    let provider: "gemini" | "anthropic";
    let geminiAvailable = false;
    let claudeAvailable = false;

    // Check what's available
    try {
      const geminiClient = getGeminiClient();
      geminiAvailable = !!geminiClient;
      log(`[API] Gemini available: ${geminiAvailable}`);
    } catch (e) {
      log(`[API] Gemini check error: ${e}`);
    }

    try {
      const anthropicKey = process.env.ANTHROPIC_API_KEY;
      claudeAvailable = !!anthropicKey;
      log(`[API] Claude available: ${claudeAvailable}`);
    } catch (e) {
      log(`[API] Claude check error: ${e}`);
    }

    // Try Gemini with Google Search grounding first (better for real-time info)
    if (geminiAvailable) {
      try {
        log("[API] Attempting Gemini with Google Search grounding...");
        generatedPeople = await generatePeopleWithGemini(
          prompt,
          count,
          genderFilter,
          ageRange
        );
        provider = "gemini";
        log(`[API] Gemini SUCCESS: generated ${generatedPeople.length} people`);
      } catch (geminiError) {
        const errMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
        log(`[API] Gemini FAILED: ${errMsg}`);

        if (claudeAvailable) {
          log("[API] Falling back to Claude...");
          generatedPeople = await generateWithClaude(prompt, count, genderFilter, ageRange);
          provider = "anthropic";
          log(`[API] Claude SUCCESS: generated ${generatedPeople.length} people`);
        } else {
          throw new Error(`Gemini failed: ${errMsg}. Claude not available as fallback.`);
        }
      }
    } else if (claudeAvailable) {
      log("[API] Using Claude (Gemini not configured)...");
      generatedPeople = await generateWithClaude(prompt, count, genderFilter, ageRange);
      provider = "anthropic";
      log(`[API] Claude SUCCESS: generated ${generatedPeople.length} people`);
    } else {
      log("[API] No AI providers available!");
      return NextResponse.json(
        {
          error: "No AI providers configured. Set GOOGLE_AI_API_KEY or ANTHROPIC_API_KEY.",
          debug: debugLog
        },
        { status: 503 }
      );
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

    log(`[API] Returning ${people.length} people`);

    return NextResponse.json({
      success: true,
      categoryId,
      categoryName: prompt,
      people,
      provider,
      count: people.length,
      debug: debugLog,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : undefined;

    log(`[API] FATAL ERROR: ${errorMessage}`);
    console.error("Full error:", error);

    return NextResponse.json(
      {
        error: `Failed to generate: ${errorMessage}`,
        debug: debugLog,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      },
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
