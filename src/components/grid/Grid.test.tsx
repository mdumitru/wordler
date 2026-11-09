import { render, screen } from "@testing-library/react";
import { Grid } from "./Grid";

const renderGrid = (guessCount: number, maxGuesses: number) =>
  render(
    <Grid
      guesses={Array(guessCount).fill("ABCDEFG")}
      currentGuess=""
      solution="ZYXWVUT"
      maxGuesses={maxGuesses}
      isGameWon={false}
      isGameOver={false}
    />,
  );

const rows = () => Array.from(screen.getByTestId("board").children);
const isDashedRow = (row: Element) =>
  row.children.length > 0 &&
  Array.from(row.children).every((c) => c.classList.contains("border-dashed"));

test("no dashed row before the sixth guess row", () => {
  renderGrid(4, 8);
  expect(rows()).toHaveLength(6);
  expect(rows().some(isDashedRow)).toBe(false);
});

test("a dashed row follows the input row from the sixth row on", () => {
  renderGrid(5, 8);
  expect(rows()).toHaveLength(7);
  expect(isDashedRow(rows()[6])).toBe(true);
  expect(rows().filter(isDashedRow)).toHaveLength(1);
});

test("the dashed row keeps moving down as guesses are used", () => {
  renderGrid(6, 8);
  expect(rows()).toHaveLength(8);
  expect(isDashedRow(rows()[7])).toBe(true);
});

test("no dashed row on the last allowed guess", () => {
  renderGrid(7, 8);
  expect(rows()).toHaveLength(8);
  expect(rows().some(isDashedRow)).toBe(false);
});

test("no dashed row when only six guesses are allowed", () => {
  renderGrid(5, 6);
  expect(rows()).toHaveLength(6);
  expect(rows().some(isDashedRow)).toBe(false);
});
