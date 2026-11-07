import { WORDS } from "../constants/wordlist";
import { VALIDGUESSES } from "../constants/validGuesses";
import { MAX_GUESSES_CAP } from "../constants/settings";

// Short words get one guess more than their length; longer words are capped.
export const getMaxGuesses = (solution: string) =>
  Math.min(MAX_GUESSES_CAP, solution.length + 1);

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
