import { getGuessStatuses } from "../../lib/statuses";
import { MiniCell } from "./MiniCell";

type Props = {
  guess: string;
  solution: string;
};

export const MiniCompletedRow = ({ guess, solution }: Props) => {
  const statuses = getGuessStatuses(guess, solution);

  return (
    <div className="flex mb-1">
      {guess.split("").map((letter, i) => (
        <MiniCell key={i} status={statuses[i]} />
      ))}
    </div>
  );
};
