import { readFileSync } from "fs";
import { join } from "path";
import {
  getSolutionLengthRange,
  getWordOfDay,
  isWordInWordList,
  setWordLists,
} from "./words";

const read = (name: string) =>
  readFileSync(join(__dirname, "../../public/words", name), "utf8");
const solutionsText = read("solutions.txt");
const WORDS = solutionsText.split("\n").filter(Boolean);

beforeAll(() => setWordLists(solutionsText, read("guesses.txt")));

const DAY = 86400000;
const NOON_2026 = Date.UTC(2026, 10, 8, 12);

test("consecutive days give words that are not neighbours in the list", () => {
  const indexes = Array.from({ length: 30 }, (_, i) =>
    WORDS.indexOf(getWordOfDay(NOON_2026 + i * DAY).toLowerCase()),
  );
  indexes.forEach((index) => expect(index).toBeGreaterThanOrEqual(0));
  const adjacent = indexes
    .slice(1)
    .filter((index, i) => Math.abs(index - indexes[i]) <= 1);
  expect(adjacent).toEqual([]);
  expect(new Set(indexes).size).toBe(indexes.length);
});

test("the daily word is stable for a given day", () => {
  expect(getWordOfDay(NOON_2026)).toBe(getWordOfDay(NOON_2026 + 1000));
});

test("a clock set before the 2022 epoch still returns a word", () => {
  const word = getWordOfDay(Date.UTC(2021, 5, 1));
  expect(WORDS).toContain(word.toLowerCase());
});

test("lookups are case-insensitive and cover both lists", () => {
  expect(isWordInWordList("CAT")).toBe(true);
  expect(isWordInWordList("aah")).toBe(true);
  expect(isWordInWordList("QWXZ")).toBe(false);
});

test("the length range comes from the solutions", () => {
  expect(getSolutionLengthRange()).toEqual({ shortest: 3, longest: 18 });
});
