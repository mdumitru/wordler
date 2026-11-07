import { MIN_ROW_CELLS } from "../../constants/settings";
import { Cell } from "./Cell";

export const EmptyRow = () => {
  const emptyCells = Array.from(Array(MIN_ROW_CELLS));

  return (
    <div className="flex mb-1">
      {emptyCells.map((_, i) => (
        <Cell key={i} />
      ))}
    </div>
  );
};
