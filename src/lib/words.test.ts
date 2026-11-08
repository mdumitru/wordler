import { WORDS } from "../constants/wordlist";
import { getWordOfDay } from "./words";

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
