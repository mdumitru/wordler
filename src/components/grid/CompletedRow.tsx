import { useState } from "react";
import { getRevealStaggerMs } from "../../lib/reveal";
import { getGuessStatuses } from "../../lib/statuses";
import { Cell } from "./Cell";

type Props = {
  guess: string;
  solution: string;
  // Delay before this row starts revealing; omit to show it already revealed.
  revealDelayMs?: number;
};

export const CompletedRow = ({ guess, solution, revealDelayMs }: Props) => {
  const statuses = getGuessStatuses(guess, solution);
  // Freeze the delay at mount: changing animation-delay mid-flight would
  // restart or skip the animation on later re-renders.
  const [startMs] = useState(revealDelayMs);
  const staggerMs = getRevealStaggerMs(guess.length);

  return (
    <div className="flex mb-1">
      {guess.split("").map((letter, i) => (
        <Cell
          key={i}
          value={letter}
          status={statuses[i]}
          revealDelayMs={
            startMs === undefined ? undefined : startMs + i * staggerMs
          }
        />
      ))}
    </div>
  );
};
