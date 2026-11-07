import { ReactNode } from "react";
import classnames from "classnames";
import { KeyValue } from "../../lib/keyboard";
import { CharStatus } from "../../lib/statuses";

type Props = {
  children?: ReactNode;
  value: KeyValue;
  width?: number;
  status?: CharStatus;
  onClick: (value: KeyValue) => void;
};

export const Key = ({
  children,
  status,
  width = 40,
  value,
  onClick,
}: Props) => {
  const classes = classnames(
    "flex items-center justify-center rounded mx-0.5 text-xs font-bold cursor-pointer hover:brightness-95 active:brightness-90",
    {
      "bg-wordle-empty dark:bg-wordle-night-key dark:text-white": !status,
      "bg-wordle-absent dark:bg-wordle-night-absent text-white":
        status === "absent",
      "bg-wordle-correct dark:bg-wordle-night-correct text-white":
        status === "correct",
      "bg-wordle-present dark:bg-wordle-night-present text-white":
        status === "present",
    },
  );

  return (
    <div
      style={{ width: `${width}px`, height: "58px" }}
      className={classes}
      onClick={() => onClick(value)}
    >
      {children || value}
    </div>
  );
};
