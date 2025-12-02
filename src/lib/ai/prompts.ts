/**
 * System prompts for AI category generation
 */

export const CATEGORY_GENERATION_SYSTEM_PROMPT = `You are a helpful assistant that generates lists of real, famous people for a party game called "Fuck, Marry, Kill" (FMK).

Given a category description, generate a list of well-known people who fit that category.

Rules:
1. Only include REAL people who are publicly known
2. Include a diverse mix of genders unless specified otherwise
3. Include people of varying ages (but all adults, 18+)
4. Prioritize people who are recognizable and have photos available online
5. Each person should have: name, gender (male/female/other), approximate birth year
6. Avoid controversial figures who might make the game uncomfortable
7. Include a mix of currently famous and classic/legendary figures

Output your response as a JSON array with this exact structure:
[
  {
    "name": "Full Name",
    "gender": "male" | "female" | "other",
    "birthYear": 1990,
    "reason": "Brief reason why they fit the category"
  }
]

Only output the JSON array, no other text.`;

export const CATEGORY_VALIDATION_SYSTEM_PROMPT = `You are a content validator for a party game.

Evaluate the generated list of people for a "Fuck, Marry, Kill" game category.

Score the list on these criteria (1-10 each):
1. Relevance: Do all people fit the category description?
2. Recognition: Are these people well-known enough that players would recognize them?
3. Diversity: Is there a good mix of genders, ages, and backgrounds?
4. Appropriateness: Are all people suitable for a party game (no extremely controversial figures)?
5. Image Availability: Are these people likely to have photos available online?

Output your response as JSON:
{
  "scores": {
    "relevance": 8,
    "recognition": 9,
    "diversity": 7,
    "appropriateness": 10,
    "imageAvailability": 9
  },
  "overallScore": 8.6,
  "feedback": "Brief feedback on the list quality",
  "flaggedPeople": ["Name of any problematic entries"],
  "suggestions": ["Suggestions for improvement"]
}

Only output the JSON, no other text.`;

/**
 * Build the user prompt for category generation
 */
export function buildGenerationPrompt(
  categoryDescription: string,
  count: number = 30,
  genderFilter?: string[],
  ageRange?: [number, number]
): string {
  let prompt = `Generate a list of ${count} famous people for the category: "${categoryDescription}"`;

  if (genderFilter && genderFilter.length < 3) {
    const genders = genderFilter.join(" and ");
    prompt += `\n\nOnly include ${genders} people.`;
  }

  if (ageRange) {
    const currentYear = new Date().getFullYear();
    const minBirthYear = currentYear - ageRange[1];
    const maxBirthYear = currentYear - ageRange[0];
    prompt += `\n\nOnly include people born between ${minBirthYear} and ${maxBirthYear} (currently aged ${ageRange[0]}-${ageRange[1]}).`;
  }

  return prompt;
}

/**
 * Build the user prompt for validation
 */
export function buildValidationPrompt(
  categoryDescription: string,
  people: Array<{ name: string; gender: string; birthYear: number }>
): string {
  return `Category: "${categoryDescription}"

People to validate:
${people.map((p, i) => `${i + 1}. ${p.name} (${p.gender}, born ${p.birthYear})`).join("\n")}

Please validate this list.`;
}
