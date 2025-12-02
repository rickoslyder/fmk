import type { Person, CustomPerson, Gender } from "@/types";

/** Options for selecting people */
export interface SelectionOptions {
  /** IDs to exclude (already used) */
  excludeIds: Set<string>;
  /** Gender filter */
  genderFilter: Gender[];
  /** Age range [min, max] */
  ageRange: [number, number];
}

/**
 * Filter people based on preferences
 */
export function filterPeople<T extends Person | CustomPerson>(
  people: T[],
  options: SelectionOptions
): T[] {
  const currentYear = new Date().getFullYear();
  const [minAge, maxAge] = options.ageRange;

  return people.filter((person) => {
    // Exclude already used
    if (options.excludeIds.has(person.id)) {
      return false;
    }

    // Gender filter
    if (!options.genderFilter.includes(person.gender)) {
      return false;
    }

    // Age filter (if birthYear available)
    if (person.birthYear) {
      const age = currentYear - person.birthYear;
      if (age < minAge || age > maxAge) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Select 3 random people from the pool
 */
export function selectThreePeople<T extends Person | CustomPerson>(
  people: T[],
  options: SelectionOptions
): [T, T, T] | null {
  const eligible = filterPeople(people, options);

  if (eligible.length < 3) {
    return null;
  }

  const shuffled = shuffle(eligible);
  return [shuffled[0], shuffled[1], shuffled[2]];
}

/**
 * Check if there are enough people for another round
 */
export function hasEnoughPeople<T extends Person | CustomPerson>(
  people: T[],
  options: SelectionOptions
): boolean {
  const eligible = filterPeople(people, options);
  return eligible.length >= 3;
}
