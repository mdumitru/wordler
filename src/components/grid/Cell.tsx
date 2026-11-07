import { CharStatus } from "../../lib/statuses";
import classnames from "classnames";
import { FLIP_MS } from "../../lib/reveal";

type Props = {
  value?: string;
  status?: CharStatus;
  // When set, the tile plays the flip reveal starting after this many ms.
  revealDelayMs?: number;
};

export const Cell = ({ value, status, revealDelayMs }: Props) => {
  const isRevealing = revealDelayMs !== undefined;
  const classes = classnames(
    "w-16 h-16 shrink-0 border-solid border-2 flex items-center justify-center mx-0.5 text-3xl font-bold rounded",
    {
      "bg-white border-wordle-empty": !status && !value,
      "bg-white border-wordle-filled": !status && value,
      "bg-wordle-absent text-white border-wordle-absent": status === "absent",
      "bg-wordle-correct text-white border-wordle-correct":
        status === "correct",
      "bg-wordle-present text-white border-wordle-present":
        status === "present",
      "cell-reveal": isRevealing,
    },
  );
  const style = isRevealing
    ? {
        animationDuration: `${FLIP_MS}ms, ${FLIP_MS / 2}ms`,
        animationDelay: `${revealDelayMs}ms, ${revealDelayMs}ms`,
      }
    : undefined;

  return (
    <>
      <div className={classes} style={style}>
        {value}
      </div>
    </>
  );
};
