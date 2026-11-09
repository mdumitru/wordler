import { MIN_ROW_CELLS } from "../../constants/settings";
import { Cell } from "./Cell";

type Props = {
  // Dashed borders for the extra row that hints the board can grow.
  isDashed?: boolean;
};

export const EmptyRow = ({ isDashed = false }: Props) => {
  const emptyCells = Array.from(Array(MIN_ROW_CELLS));

  return (
    <div className="flex mb-1">
      {emptyCells.map((_, i) => (
        <Cell key={i} isDashed={isDashed} />
      ))}
    </div>
  );
};
