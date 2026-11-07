import { getGuessStatuses } from "../../lib/statuses";
import { MAX_WORD_LENGTH } from "../../constants/settings";
import { Cell } from "./Cell";

type Props = {
  guess: string;
};

export const CompletedRow = ({ guess }: Props) => {
  const statuses = getGuessStatuses(guess);
  const emptyCells = Array.from(Array(MAX_WORD_LENGTH - guess.length));

  return (
    <div className="flex justify-center mb-1">
      {guess.split("").map((letter, i) => (
        <Cell key={i} value={letter} status={statuses[i]} />
      ))}
      {emptyCells.map((_, i) => (
        <Cell key={`empty-${i}`} />
      ))}
    </div>
  );
};
