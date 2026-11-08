// Game progress survives reloads. Storage can be unavailable (private mode,
// quota, disabled cookies); the game then simply starts fresh each visit.
export type SavedGame = {
  solution: string;
  guesses: string[];
  isGameWon: boolean;
  isAnswerRevealed: boolean;
};

const STORAGE_KEY = "game";

const isSavedGame = (value: unknown): value is SavedGame => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  const game = value as Record<string, unknown>;
  return (
    typeof game.solution === "string" &&
    game.solution.length > 0 &&
    Array.isArray(game.guesses) &&
    game.guesses.every((guess) => typeof guess === "string") &&
    typeof game.isGameWon === "boolean" &&
    typeof game.isAnswerRevealed === "boolean"
  );
};

export const loadGame = (): SavedGame | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!isSavedGame(parsed)) {
      console.warn("Ignoring malformed saved game");
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn("Could not load saved game", err);
    return null;
  }
};

export const saveGame = (game: SavedGame) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(game));
  } catch (err) {
    console.warn("Could not save game", err);
  }
};
