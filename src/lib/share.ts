import { CharStatus, getGuessStatuses } from "./statuses";

const EMOJI: Record<CharStatus, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
};

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
  return [`Not Wordle ${score}/${maxGuesses}`, "", ...rows].join("\n");
};
