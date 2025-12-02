import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client (server-side only)
let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      return null;
    }
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

export interface GeminiGeneratedPerson {
  name: string;
  gender: "male" | "female" | "other";
  birthYear: number;
  reason?: string;
}

/**
 * Generate people using Gemini with Google Search grounding
 * This provides real-time, accurate information about celebrities
 */
export async function generatePeopleWithGemini(
  categoryDescription: string,
  count: number = 30,
  genderFilter?: string[],
  ageRange?: [number, number]
): Promise<GeminiGeneratedPerson[]> {
  const client = getGeminiClient();
  if (!client) {
    throw new Error("GOOGLE_AI_API_KEY environment variable is not set");
  }

  // Build the prompt
  let prompt = `Generate a list of exactly ${count} real, famous people for a party game category: "${categoryDescription}"

Requirements:
1. Only include REAL people who are publicly well-known
2. Prioritize people who are currently relevant and recognizable
3. Include people who would have photos available online
4. Each person must be an adult (18+)`;

  if (genderFilter && genderFilter.length < 3) {
    const genders = genderFilter.join(" and ");
    prompt += `\n5. Only include ${genders} people`;
  }

  if (ageRange) {
    const currentYear = new Date().getFullYear();
    const minBirthYear = currentYear - ageRange[1];
    const maxBirthYear = currentYear - ageRange[0];
    prompt += `\n6. Only include people born between ${minBirthYear} and ${maxBirthYear} (currently aged ${ageRange[0]}-${ageRange[1]})`;
  }

  prompt += `

Use Google Search to find current, accurate information about people in this category.

IMPORTANT: Output ONLY a valid JSON array with this exact structure, no other text:
[
  {
    "name": "Full Name",
    "gender": "male" | "female" | "other",
    "birthYear": 1990,
    "reason": "Brief reason why they fit the category"
  }
]`;

  // Enable Google Search grounding
  const groundingTool = {
    googleSearch: {},
  };

  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      tools: [groundingTool],
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("No text response from Gemini");
  }

  // Parse JSON response
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.error("Gemini response:", text);
    throw new Error("No JSON array found in Gemini response");
  }

  const people: GeminiGeneratedPerson[] = JSON.parse(jsonMatch[0]);
  return people;
}
