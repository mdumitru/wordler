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
      "bg-white dark:bg-wordle-night-bg border-wordle-empty dark:border-wordle-night-empty":
        !status && !value,
      "bg-white dark:bg-wordle-night-bg border-wordle-filled dark:border-wordle-night-filled":
        !status && value,
      "bg-wordle-absent dark:bg-wordle-night-absent text-white border-wordle-absent dark:border-wordle-night-absent":
        status === "absent",
      "bg-wordle-correct dark:bg-wordle-night-correct text-white border-wordle-correct dark:border-wordle-night-correct":
        status === "correct",
      "bg-wordle-present dark:bg-wordle-night-present text-white border-wordle-present dark:border-wordle-night-present":
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
