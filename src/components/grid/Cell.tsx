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
    "w-11 h-11 shrink-0 border-solid border-2 flex items-center justify-center mx-0.5 text-lg font-bold rounded",
    {
      "bg-white border-slate-200": !status,
      "bg-slate-400 text-white border-slate-400": status === "absent",
      "bg-green-500 text-white border-green-500": status === "correct",
      "bg-yellow-500 text-white border-yellow-500": status === "present",
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
