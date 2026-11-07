import { CharStatus, getGuessStatuses } from "./statuses";

const EMOJI: Record<CharStatus, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
};

export const countLetters = (guesses: string[]) =>
  guesses.reduce((total, guess) => total + guess.length, 0);

// Spoiler-free result: a score line followed by one emoji row per guess.
// `guesses` must be the player's own guesses, without any revealed answer row.
export const getShareText = (
  guesses: string[],
  solution: string,
  maxGuesses: number,
  isGameWon: boolean,
) => {
  const score = isGameWon ? guesses.length : "X";
  const rows = guesses.map((guess) =>
    getGuessStatuses(guess, solution)
      .map((status) => EMOJI[status] ?? EMOJI.absent)
      .join(""),
  );
  const letters = countLetters(guesses);
  const header = `Wordler ${score}/${maxGuesses} · ${letters} ${
    letters === 1 ? "letter" : "letters"
  }`;
  return [header, "", ...rows].join("\n");
};
