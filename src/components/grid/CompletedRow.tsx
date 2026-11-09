import { useState } from "react";
import {
  BOUNCE_MS,
  getBounceStaggerMs,
  getRevealStaggerMs,
  getRowRevealMs,
} from "../../lib/reveal";
import { getGuessStatuses } from "../../lib/statuses";
import { Cell } from "./Cell";

type Props = {
  guess: string;
  solution: string;
  // Delay before this row starts revealing; omit to show it already revealed.
  revealDelayMs?: number;
  // The winning guess: its tiles bounce once they have been revealed.
  isWinningRow?: boolean;
  // Easy mode: the guess has the answer's length.
  isLengthMatch?: boolean;
};

export const CompletedRow = ({
  guess,
  solution,
  revealDelayMs,
  isWinningRow = false,
  isLengthMatch = false,
}: Props) => {
  const statuses = getGuessStatuses(guess, solution);
  // Freeze the delay at mount: changing animation-delay mid-flight would
  // restart or skip the animation on later re-renders.
  const [startMs] = useState(revealDelayMs);
  const staggerMs = getRevealStaggerMs(guess.length);
  const bounceStartMs = (startMs ?? 0) + getRowRevealMs(guess.length);
  const bounceStaggerMs = getBounceStaggerMs(guess.length);

  return (
    <div
      // w-max: hug this row's tiles instead of stretching to the widest row,
      // so the easy-mode ring stays the guess's own size.
      className={`flex w-max mb-1${
        isLengthMatch
          ? " rounded-lg ring-2 ring-offset-1 ring-indigo-500 dark:ring-indigo-400 dark:ring-offset-wordle-night-bg"
          : ""
      }`}
      role="group"
      aria-label={`Guess: ${guess}${isLengthMatch ? " (right length)" : ""}`}
    >
      {guess.split("").map((letter, i) => (
        // The bounce lives on a wrapper so its transform does not replace
        // the tile's own flip animation.
        <div
          key={i}
          className={isWinningRow ? "cell-bounce" : undefined}
          style={
            isWinningRow
              ? {
                  animationDuration: `${BOUNCE_MS}ms`,
                  animationDelay: `${bounceStartMs + i * bounceStaggerMs}ms`,
                }
              : undefined
          }
        >
          <Cell
            value={letter}
            status={statuses[i]}
            revealDelayMs={
              startMs === undefined ? undefined : startMs + i * staggerMs
            }
          />
        </div>
      ))}
    </div>
  );
};
