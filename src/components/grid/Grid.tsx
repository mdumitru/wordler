import { useEffect, useRef } from "react";
import { MIN_GUESSES } from "../../constants/settings";
import { CompletedRow } from "./CompletedRow";
import { CurrentRow } from "./CurrentRow";
import { EmptyRow } from "./EmptyRow";

type Props = {
  guesses: string[];
  currentGuess: string;
  solution: string;
  maxGuesses: number;
  isGameWon: boolean;
  isGameOver: boolean;
};

export const Grid = ({
  guesses,
  currentGuess,
  solution,
  maxGuesses,
  isGameWon,
  isGameOver,
}: Props) => {
  const showCurrentRow = !isGameOver && guesses.length < maxGuesses;
  // The board always starts 6 rows tall; longer words with extra guesses
  // grow it one row at a time as those guesses are used.
  const empties = Array.from(
    Array(Math.max(0, MIN_GUESSES - guesses.length - (showCurrentRow ? 1 : 0))),
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  // Only rows added since the last render play the reveal animation.
  const prevCountRef = useRef(guesses.length);
  const firstNewRow = Math.min(prevCountRef.current, guesses.length);

  useEffect(() => {
    prevCountRef.current = guesses.length;
  }, [guesses.length]);
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
    // min-h-0 lets the board shrink to the space left above the keyboard,
    // so it only scrolls once the rows no longer fit on screen.
    <div className="flex flex-col min-h-0 pb-6">
      <div
        ref={scrollRef}
        // Top padding leaves room for winning tiles to bounce without clipping.
        className="board-scroll relative min-h-0 overflow-auto pt-6"
      >
        <div ref={rowsRef} data-testid="board" className="w-max mx-auto">
          {guesses.map((guess, i) => (
            <CompletedRow
              key={i}
              guess={guess}
              solution={solution}
              revealDelayMs={i >= firstNewRow ? 0 : undefined}
              isWinningRow={isGameWon && i === guesses.length - 1}
            />
          ))}
          {showCurrentRow && <CurrentRow guess={currentGuess} />}
          {empties.map((_, i) => (
            <EmptyRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
