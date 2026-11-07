import { useEffect, useRef } from "react";
import { VISIBLE_ROWS } from "../../constants/settings";
import { CompletedRow } from "./CompletedRow";
import { CurrentRow } from "./CurrentRow";
import { EmptyRow } from "./EmptyRow";

type Props = {
  guesses: string[];
  currentGuess: string;
  solution: string;
};

// One row is a 2.5rem cell plus a 0.25rem bottom margin.
const ROW_HEIGHT_REM = 2.75;

export const Grid = ({ guesses, currentGuess, solution }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const empties = Array.from(
    Array(Math.max(0, VISIBLE_ROWS - 1 - guesses.length))
  );

  // Keep the row being typed in view once the board is taller than the viewport.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [guesses.length]);

  return (
    <div className="pb-6">
      <div
        ref={scrollRef}
        className="board-scroll overflow-auto"
        style={{ maxHeight: `${VISIBLE_ROWS * ROW_HEIGHT_REM}rem` }}
      >
        <div className="w-max mx-auto">
          {guesses.map((guess, i) => (
            <CompletedRow key={i} guess={guess} solution={solution} />
          ))}
          <CurrentRow guess={currentGuess} />
          {empties.map((_, i) => (
            <EmptyRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
