import { WORDS } from "../constants/wordlist";
import { VALIDGUESSES } from "../constants/validGuesses";
import { MIN_GUESSES } from "../constants/settings";

// January 1, 2022 game epoch.
const EPOCH_MS = 1641013200000;
const MS_IN_DAY = 86400000;
// Fixed seed: every player gets the same daily sequence. Changing it reshuffles
// all future (and past) daily words.
const DAILY_SEED = 0x5eed2022;

// Long words get one guess more than their length; shorter words get a floor.
export const getMaxGuesses = (solution: string) =>
  Math.max(MIN_GUESSES, solution.length + 1);

export const isWordInWordList = (word: string) => {
  const lower = word.toLowerCase();
  return WORDS.includes(lower) || VALIDGUESSES.includes(lower);
};

export const isSolution = (word: string) => WORDS.includes(word.toLowerCase());

// mulberry32: a tiny deterministic PRNG returning floats in [0, 1).
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

let dailyOrder: number[] | undefined;

// A stable Fisher-Yates permutation of the solution indexes, so daily words
// do not walk through the list alphabetically.
const getDailyOrder = () => {
  if (!dailyOrder || dailyOrder.length !== WORDS.length) {
    const random = mulberry32(DAILY_SEED);
    dailyOrder = WORDS.map((_, i) => i);
    for (let i = dailyOrder.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [dailyOrder[i], dailyOrder[j]] = [dailyOrder[j], dailyOrder[i]];
    }
  }
  return dailyOrder;
};

export const getWordOfDay = (now = Date.now()) => {
  const order = getDailyOrder();
  const day = Math.floor((now - EPOCH_MS) / MS_IN_DAY);
  // Clamp into range even for clocks set before the epoch.
  const index = ((day % order.length) + order.length) % order.length;
  return WORDS[order[index]].toUpperCase();
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
