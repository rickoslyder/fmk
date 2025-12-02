import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client (server-side only)
let geminiClient: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    if (!apiKey) {
      console.log("[Gemini] No GOOGLE_AI_API_KEY found in environment");
      return null;
    }
    console.log("[Gemini] Initializing client with API key:", apiKey.substring(0, 10) + "...");
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

export interface GeminiGenerationResult {
  people: GeminiGeneratedPerson[];
  logs: string[];
  rawResponse?: string;
}

/**
 * Generate people using Gemini with Google Search grounding
 * This provides real-time, accurate information about celebrities
 */
export async function generatePeopleWithGemini(
  categoryDescription: string,
  count: number = 30,
  genderFilter?: string[],
  ageRange?: [number, number],
  onProgress?: (step: string) => void
): Promise<GeminiGenerationResult> {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  log(`[Gemini] Starting generation for: "${categoryDescription}"`);
  onProgress?.("Initializing Gemini AI...");

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

  log("[Gemini] Built prompt, length: " + prompt.length);
  onProgress?.("Searching the web for people...");

  // Enable Google Search grounding
  const groundingTool = {
    googleSearch: {},
  };

  let rawResponse = "";

  try {
    log("[Gemini] Calling generateContent with model: gemini-2.5-flash");
    const response = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [groundingTool],
      },
    });

    log("[Gemini] Got response, type: " + typeof response);
    log("[Gemini] Response keys: " + Object.keys(response || {}).join(", "));

    onProgress?.("Processing AI response...");

    // Try multiple ways to get the response text
    let text = response.text;
    log("[Gemini] response.text preview: " + (text?.substring(0, 200) || "EMPTY/UNDEFINED"));

    // If .text is empty, try other properties
    if (!text) {
      log("[Gemini] Trying alternative response access...");
      log("[Gemini] response constructor: " + response?.constructor?.name);

      // Try to stringify the whole response
      try {
        const fullResponse = JSON.stringify(response, null, 2);
        log("[Gemini] Full response JSON: " + fullResponse.substring(0, 2000));
        rawResponse = fullResponse;
      } catch (e) {
        log("[Gemini] Could not stringify response: " + e);
      }

      // Check if response has candidates
      const anyResponse = response as unknown as Record<string, unknown>;
      if (anyResponse.candidates) {
        log("[Gemini] Found candidates: " + JSON.stringify(anyResponse.candidates).substring(0, 500));
      }
      if (anyResponse.text === "") {
        log("[Gemini] response.text is empty string (not undefined)");
      }

      const err = new Error("No text response from Gemini - response.text is empty or undefined");
      (err as Error & { logs: string[] }).logs = logs;
      throw err;
    }

    rawResponse = text;
    log("[Gemini] Got response text, length: " + text.length);
    log("[Gemini] First 500 chars: " + text.substring(0, 500));

    // Parse JSON response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      log("[Gemini] No JSON array found. Full response saved to rawResponse");
      const err = new Error(`No JSON array in response. Got: ${text.substring(0, 300)}`);
      (err as Error & { logs: string[]; rawResponse: string }).logs = logs;
      (err as Error & { logs: string[]; rawResponse: string }).rawResponse = rawResponse;
      throw err;
    }

    log("[Gemini] Extracted JSON, length: " + jsonMatch[0].length);
    onProgress?.("Parsing results...");

    let people: GeminiGeneratedPerson[];
    try {
      people = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      log("[Gemini] JSON parse error: " + parseError);
      log("[Gemini] Attempted to parse: " + jsonMatch[0].substring(0, 500));
      const err = new Error(`Failed to parse JSON: ${parseError}`);
      (err as Error & { logs: string[] }).logs = logs;
      throw err;
    }

    log("[Gemini] Parsed array length: " + people.length);
    if (people.length > 0) {
      log("[Gemini] First person: " + JSON.stringify(people[0]));
    } else {
      log("[Gemini] WARNING: Parsed array is EMPTY!");
    }

    return { people, logs, rawResponse };
  } catch (error) {
    log("[Gemini] Error during generation: " + (error instanceof Error ? error.message : String(error)));
    if (error instanceof Error) {
      (error as Error & { logs: string[] }).logs = logs;
    }
    throw error;
  }
}
