import { WORDS } from "../constants/wordlist";
import { VALIDGUESSES } from "../constants/validGuesses";
import { MIN_GUESSES } from "../constants/settings";

// Long words get one guess more than their length; shorter words get a floor.
export const getMaxGuesses = (solution: string) =>
  Math.max(MIN_GUESSES, solution.length + 1);

export const isWordInWordList = (word: string) => {
  return (
    WORDS.includes(word.toLowerCase()) ||
    VALIDGUESSES.includes(word.toLowerCase())
  );
};

export const getWordOfDay = () => {
  // January 1, 2022 Game Epoch
  const epochMs = 1641013200000;
  const now = Date.now();
  const msInDay = 86400000;
  const index = Math.floor((now - epochMs) / msInDay);

  return WORDS[index % WORDS.length].toUpperCase();
};

export const getRandomWord = (exclude: string) => {
  if (WORDS.length < 2) {
    return WORDS[0].toUpperCase();
  }
  let word = exclude;
  while (word === exclude) {
    word = WORDS[Math.floor(Math.random() * WORDS.length)].toUpperCase();
  }
  return word;
};
