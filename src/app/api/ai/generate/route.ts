import { NextRequest, NextResponse } from "next/server";
import {
  getAnthropicClient,
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
      throw new Error("No text response from AI");
    }

    // Parse JSON response
    let generatedPeople: GeneratedPerson[];
    try {
      // Try to extract JSON from the response (in case there's extra text)
      const jsonMatch = textContent.text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("No JSON array found in response");
      }
      generatedPeople = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse AI response:", textContent.text);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
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

    return NextResponse.json({
      success: true,
      categoryId,
      categoryName: prompt,
      people,
      rawResponse: generatedPeople,
    });
  } catch (error) {
    console.error("AI generation error:", error);

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to generate category" },
      { status: 500 }
    );
  }
}
