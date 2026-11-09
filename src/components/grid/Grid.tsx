import { useCallback, useEffect, useRef } from "react";
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
  // Easy mode: ring the guesses that have the answer's length.
  highlightLength?: boolean;
};

export const Grid = ({
  guesses,
  currentGuess,
  solution,
  maxGuesses,
  isGameWon,
  isGameOver,
  highlightLength = false,
}: Props) => {
  const showCurrentRow = !isGameOver && guesses.length < maxGuesses;
  // The board always starts 6 rows tall; longer words with extra guesses
  // grow it one row at a time as those guesses are used.
  const empties = Array.from(
    Array(Math.max(0, MIN_GUESSES - guesses.length - (showCurrentRow ? 1 : 0))),
  );
  // Once the input row reaches the sixth row or beyond, keep one dashed row
  // after it while more guesses remain, so the board visibly grows.
  const showGrowRow =
    showCurrentRow &&
    guesses.length >= MIN_GUESSES - 1 &&
    guesses.length + 1 < maxGuesses;
  const scrollRef = useRef<HTMLDivElement>(null);
  // Only rows added since the last render play the reveal animation.
  const prevCountRef = useRef(guesses.length);
  const firstNewRow = Math.min(prevCountRef.current, guesses.length);

  useEffect(() => {
    prevCountRef.current = guesses.length;
  }, [guesses.length]);
  const rowsRef = useRef<HTMLDivElement>(null);

  // Keep the active row (or the last row once the board is full) in view,
  // and, while typing a long guess, the empty box after its newest letter.
  const scrollToActive = useCallback(() => {
    const container = scrollRef.current;
    const rows = rowsRef.current?.children;
    if (!container || !rows || rows.length === 0) {
      return;
    }
    const row = rows[Math.min(guesses.length, rows.length - 1)] as HTMLElement;
    // Bring the dashed row after the input row into view too.
    const lastRow = (
      showGrowRow ? (row.nextElementSibling ?? row) : row
    ) as HTMLElement;
    const rowBottom = lastRow.offsetTop + lastRow.offsetHeight;
    container.scrollTop = Math.max(0, rowBottom - container.clientHeight);

    if (!showCurrentRow || currentGuess.length === 0) {
      return;
    }
    const cell = (row.children[currentGuess.length] ??
      row.children[currentGuess.length - 1]) as HTMLElement | undefined;
    if (!cell) {
      return;
    }
    // Cells are positioned relative to the scroll container (its offsetParent).
    const cellLeft = cell.offsetLeft;
    const cellRight = cellLeft + cell.offsetWidth;
    if (cellRight > container.scrollLeft + container.clientWidth) {
      container.scrollLeft = cellRight - container.clientWidth;
    } else if (cellLeft < container.scrollLeft) {
      container.scrollLeft = cellLeft;
    }
  }, [guesses.length, currentGuess.length, showCurrentRow, showGrowRow]);

  useEffect(() => {
    scrollToActive();
    window.addEventListener("resize", scrollToActive);
    return () => window.removeEventListener("resize", scrollToActive);
  }, [scrollToActive]);

  return (
    // min-h-0 lets the board shrink to the space left above the keyboard,
    // so it only scrolls once the rows no longer fit on screen.
    <div className="flex flex-col min-h-0 pb-2 sm:pb-6">
      <div
        ref={scrollRef}
        // Scrollable, so keyboard users can focus it to scroll; name it.
        tabIndex={0}
        role="region"
        aria-label="Board"
        // Top padding leaves room for winning tiles to bounce without clipping.
        className="board-scroll relative min-h-0 overflow-auto pt-6"
      >
        {/* px-1 leaves room for the easy-mode ring around a row. */}
        <div ref={rowsRef} data-testid="board" className="w-max mx-auto px-1">
          {guesses.map((guess, i) => (
            <CompletedRow
              key={i}
              guess={guess}
              solution={solution}
              revealDelayMs={i >= firstNewRow ? 0 : undefined}
              isWinningRow={isGameWon && i === guesses.length - 1}
              isLengthMatch={
                highlightLength &&
                guess !== solution &&
                guess.length === solution.length
              }
            />
          ))}
          {showCurrentRow && <CurrentRow guess={currentGuess} />}
          {showGrowRow && <EmptyRow isDashed />}
          {empties.map((_, i) => (
            <EmptyRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
