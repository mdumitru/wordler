import { useEffect, useRef } from "react";
import { VISIBLE_ROWS } from "../../constants/settings";
import { CompletedRow } from "./CompletedRow";
import { CurrentRow } from "./CurrentRow";
import { EmptyRow } from "./EmptyRow";

type Props = {
  guesses: string[];
  currentGuess: string;
  solution: string;
  maxGuesses: number;
};

// One row is a 2.5rem cell plus a 0.25rem bottom margin.
const ROW_HEIGHT_REM = 2.75;

export const Grid = ({
  guesses,
  currentGuess,
  solution,
  maxGuesses,
}: Props) => {
  const hasGuessesLeft = guesses.length < maxGuesses;
  const empties = Array.from(
    Array(Math.max(0, maxGuesses - 1 - guesses.length)),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement>(null);

  // Keep the active row (or the last row once the board is full) in view.
  useEffect(() => {
    const container = scrollRef.current;
    const rows = rowsRef.current?.children;
    if (!container || !rows || rows.length === 0) {
      return;
    }
    const row = rows[Math.min(guesses.length, rows.length - 1)] as HTMLElement;
    const rowBottom = row.offsetTop + row.offsetHeight;
    container.scrollTop = Math.max(0, rowBottom - container.clientHeight);
  }, [guesses.length]);

  return (
    <div className="pb-6">
      <div
        ref={scrollRef}
        className="board-scroll relative overflow-auto"
        style={{ maxHeight: `${VISIBLE_ROWS * ROW_HEIGHT_REM}rem` }}
      >
        <div ref={rowsRef} className="w-max mx-auto">
          {guesses.map((guess, i) => (
            <CompletedRow key={i} guess={guess} solution={solution} />
          ))}
          {hasGuessesLeft && <CurrentRow guess={currentGuess} />}
          {empties.map((_, i) => (
            <EmptyRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
