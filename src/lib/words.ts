import { MIN_GUESSES } from "../constants/settings";

// January 1, 2022 game epoch.
const EPOCH_MS = 1641013200000;
const MS_IN_DAY = 86400000;
// Fixed seed: every player gets the same daily sequence. Changing it reshuffles
// all future (and past) daily words.
const DAILY_SEED = 0x5eed2022;

// The word lists are served as plain text from public/words/ and fetched at
// startup instead of being bundled into the JavaScript.
type WordLists = {
  solutions: string[];
  solutionSet: Set<string>;
  guessSet: Set<string>;
  shortest: number;
  longest: number;
  // Stable shuffle of solution indexes for the daily word.
  dailyOrder: number[];
};

let lists: WordLists | undefined;
let loading: Promise<void> | undefined;

const parseList = (text: string) =>
  text
    .split(/\r?\n/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);

// mulberry32: a tiny deterministic PRNG returning floats in [0, 1).
const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// A stable Fisher-Yates permutation, so daily words do not walk through the
// list alphabetically.
const shuffledIndexes = (length: number) => {
  const random = mulberry32(DAILY_SEED);
  const order = Array.from({ length }, (_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

// Installs the lists from their file contents (also used by tests).
export const setWordLists = (solutionsText: string, guessesText: string) => {
  const solutions = parseList(solutionsText);
  if (solutions.length === 0) {
    throw new Error("The solution list is empty");
  }
  let shortest = Infinity;
  let longest = 0;
  for (const word of solutions) {
    shortest = Math.min(shortest, word.length);
    longest = Math.max(longest, word.length);
  }
  lists = {
    solutions,
    solutionSet: new Set(solutions),
    guessSet: new Set(parseList(guessesText)),
    shortest,
    longest,
    dailyOrder: shuffledIndexes(solutions.length),
  };
};

// BASE_URL always ends in "/", and every path starts with one.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

const fetchText = async (path: string) => {
  const response = await fetch(`${BASE}${path}`);
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status}`);
  }
  return response.text();
};

export const areWordsLoaded = () => lists !== undefined;

// Fetches both lists once; a failed load can be retried by calling it again.
export const loadWords = () => {
  if (!loading) {
    loading = Promise.all([
      fetchText("/words/solutions.txt"),
      fetchText("/words/guesses.txt"),
    ])
      .then(([solutions, guesses]) => setWordLists(solutions, guesses))
      .catch((err) => {
        loading = undefined;
        throw err;
      });
  }
  return loading;
};

const getLists = () => {
  if (!lists) {
    throw new Error("Word lists used before loadWords() finished");
  }
  return lists;
};

// Shortest and longest possible solution.
export const getSolutionLengthRange = () => {
  const { shortest, longest } = getLists();
  return { shortest, longest };
};

// Long words get one guess more than their length; shorter words get a floor.
export const getMaxGuesses = (solution: string) =>
  Math.max(MIN_GUESSES, solution.length + 1);

export const isWordInWordList = (word: string) => {
  const { solutionSet, guessSet } = getLists();
  const lower = word.toLowerCase();
  return solutionSet.has(lower) || guessSet.has(lower);
};

export const isSolution = (word: string) =>
  getLists().solutionSet.has(word.toLowerCase());

export const getWordOfDay = (now = Date.now()) => {
  const { solutions, dailyOrder } = getLists();
  const day = Math.floor((now - EPOCH_MS) / MS_IN_DAY);
  // Clamp into range even for clocks set before the epoch.
  const n = dailyOrder.length;
  const index = ((day % n) + n) % n;
  return solutions[dailyOrder[index]].toUpperCase();
};

export const getRandomWord = (exclude: string) => {
  const { solutions } = getLists();
  if (solutions.length < 2) {
    return solutions[0].toUpperCase();
  }
  let word = exclude;
  while (word === exclude) {
    word =
      solutions[Math.floor(Math.random() * solutions.length)].toUpperCase();
  }
  return word;
};
