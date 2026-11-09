import { ordinal } from "./ordinal";
import { getGuessStatuses } from "./statuses";

// easy: a guess with the answer's length is highlighted and announced.
// medium: the classic rules.
// hard: every guess must reuse the hints found so far.
export type Mode = "easy" | "medium" | "hard";

export const MODES: Mode[] = ["easy", "medium", "hard"];

const STORAGE_KEY = "mode";
const DEFAULT_MODE: Mode = "medium";

const isMode = (value: unknown): value is Mode => MODES.includes(value as Mode);

export const loadMode = (): Mode => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return isMode(stored) ? stored : DEFAULT_MODE;
  } catch (err) {
    console.warn("Could not load mode", err);
    return DEFAULT_MODE;
  }
};

export const saveMode = (mode: Mode) => {
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (err) {
    console.warn("Could not save mode", err);
  }
};

// Hard mode, as in Wordle: green letters stay in their spot and yellow
// letters must be reused. Returns the first broken rule, or null.
export const findHardModeViolation = (
  guess: string,
  guesses: string[],
  solution: string,
): string | null => {
  const fixed = new Map<number, string>();
  // Fewest copies of each letter the answer is known to contain.
  const required = new Map<string, number>();

  guesses.forEach((previous) => {
    const statuses = getGuessStatuses(previous, solution);
    const counts = new Map<string, number>();
    previous.split("").forEach((letter, i) => {
      if (statuses[i] === "correct") {
        fixed.set(i, letter);
      }
      if (statuses[i] !== "absent") {
        counts.set(letter, (counts.get(letter) ?? 0) + 1);
      }
    });
    counts.forEach((n, letter) =>
      required.set(letter, Math.max(required.get(letter) ?? 0, n)),
    );
  });

  const positions = Array.from(fixed.keys()).sort((a, b) => a - b);
  for (const i of positions) {
    if (guess[i] !== fixed.get(i)) {
      return `${ordinal(i + 1)} letter must be ${fixed.get(i)}`;
    }
  }
  for (const [letter, n] of Array.from(required)) {
    const have = guess.split("").filter((c) => c === letter).length;
    if (have < n) {
      return n === 1
        ? `Guess must contain ${letter}`
        : `Guess must contain ${n} ${letter}s`;
    }
  }
  return null;
};
