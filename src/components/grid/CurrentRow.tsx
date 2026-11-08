import { MIN_ROW_CELLS } from "../../constants/settings";
import { Cell } from "./Cell";

type Props = {
  guess: string;
};

export const CurrentRow = ({ guess }: Props) => {
  const splitGuess = guess.split("");
  const emptyCells = Array.from(
    Array(Math.max(0, MIN_ROW_CELLS - splitGuess.length))
  );

  return (
    <div className="flex mb-1" role="group" aria-label="Current guess">
      {splitGuess.map((letter, i) => (
        <Cell key={i} value={letter} />
      ))}
      {emptyCells.map((_, i) => (
        <Cell key={`empty-${i}`} />
      ))}
    </div>
  );
};
