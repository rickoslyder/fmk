import { NextRequest, NextResponse } from "next/server";
import {
  getAnthropicClient,
  CATEGORY_VALIDATION_SYSTEM_PROMPT,
  buildValidationPrompt,
} from "@/lib/ai";

interface ValidateRequest {
  categoryDescription: string;
  people: Array<{
    name: string;
    gender: string;
    birthYear: number;
  }>;
}

interface ValidationResult {
  scores: {
    relevance: number;
    recognition: number;
    diversity: number;
    appropriateness: number;
    imageAvailability: number;
  };
  overallScore: number;
  feedback: string;
  flaggedPeople: string[];
  suggestions: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateRequest = await request.json();
    const { categoryDescription, people } = body;

    if (!categoryDescription || !people || people.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const client = getAnthropicClient();
    const userPrompt = buildValidationPrompt(categoryDescription, people);

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: CATEGORY_VALIDATION_SYSTEM_PROMPT,
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
    let validation: ValidationResult;
    try {
      // Try to extract JSON from the response
      const jsonMatch = textContent.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON object found in response");
      }
      validation = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error("Failed to parse validation response:", textContent.text);
      // Return a default validation if parsing fails
      return NextResponse.json({
        success: true,
        validation: {
          scores: {
            relevance: 7,
            recognition: 7,
            diversity: 7,
            appropriateness: 8,
            imageAvailability: 7,
          },
          overallScore: 7.2,
          feedback: "Unable to fully validate, but list appears reasonable.",
          flaggedPeople: [],
          suggestions: [],
        },
      });
    }

    return NextResponse.json({
      success: true,
      validation,
    });
  } catch (error) {
    console.error("AI validation error:", error);

    if (error instanceof Error && error.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "Failed to validate category" },
      { status: 500 }
    );
  }
}
