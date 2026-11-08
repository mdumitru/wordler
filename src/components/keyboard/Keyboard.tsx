import { useEffect, useRef } from "react";
import { KeyValue } from "../../lib/keyboard";
import { getStatuses } from "../../lib/statuses";
import { Key } from "./Key";

type Props = {
  onChar: (value: string) => void;
  onDelete: () => void;
  onEnter: () => void;
  guesses: string[];
  solution: string;
  // While a modal is open, physical keys must not reach the game.
  isInputDisabled?: boolean;
};

const isTextField = (el: Element | null) =>
  el instanceof HTMLElement &&
  (el.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

// A control the user reached with the keyboard keeps its own Enter
// activation. One focused by a mouse click (or given focus back after a modal
// closed by mouse) does not, so Enter still submits the guess.
const isKeyboardFocusedControl = (el: Element | null) => {
  if (!(el instanceof HTMLElement) || !el.matches("button, a[href]")) {
    return false;
  }
  try {
    return el.matches(":focus-visible");
  } catch {
    // Engines without :focus-visible support (e.g. jsdom).
    return false;
  }
};

export const Keyboard = ({
  onChar,
  onDelete,
  onEnter,
  guesses,
  solution,
  isInputDisabled = false,
}: Props) => {
  const charStatuses = getStatuses(guesses, solution);

  const onClick = (value: KeyValue) => {
    if (value === "ENTER") {
      return onEnter();
    }
    if (value === "DELETE") {
      return onDelete();
    }
    return onChar(value);
  };

  // The window listener is attached once and always calls the latest props.
  const latestRef = useRef({ onChar, onDelete, onEnter, isInputDisabled });
  latestRef.current = { onChar, onDelete, onEnter, isInputDisabled };

  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      const latest = latestRef.current;
      if (latest.isInputDisabled || e.ctrlKey || e.metaKey || e.altKey) {
        return;
      }
      const active = document.activeElement;
      if (isTextField(active)) {
        return;
      }
      if (e.code === "Enter" || e.code === "NumpadEnter" || e.key === "Enter") {
        if (e.repeat || isKeyboardFocusedControl(active)) {
          return;
        }
        // Keep a mouse-focused button from also activating.
        e.preventDefault();
        latest.onEnter();
      } else if (e.code === "Backspace" || e.key === "Backspace") {
        // Repeats are allowed so holding Backspace keeps deleting.
        latest.onDelete();
      } else {
        const key = e.key.toUpperCase();
        if (key.length === 1 && key >= "A" && key <= "Z") {
          latest.onChar(key);
        }
      }
    };
    window.addEventListener("keydown", listener);
    return () => {
      window.removeEventListener("keydown", listener);
    };
  }, []);

  return (
    <div>
      <div className="flex justify-center mb-1">
        <Key value="Q" onClick={onClick} status={charStatuses["Q"]} />
        <Key value="W" onClick={onClick} status={charStatuses["W"]} />
        <Key value="E" onClick={onClick} status={charStatuses["E"]} />
        <Key value="R" onClick={onClick} status={charStatuses["R"]} />
        <Key value="T" onClick={onClick} status={charStatuses["T"]} />
        <Key value="Y" onClick={onClick} status={charStatuses["Y"]} />
        <Key value="U" onClick={onClick} status={charStatuses["U"]} />
        <Key value="I" onClick={onClick} status={charStatuses["I"]} />
        <Key value="O" onClick={onClick} status={charStatuses["O"]} />
        <Key value="P" onClick={onClick} status={charStatuses["P"]} />
      </div>
      <div className="flex justify-center mb-1">
        <Key value="A" onClick={onClick} status={charStatuses["A"]} />
        <Key value="S" onClick={onClick} status={charStatuses["S"]} />
        <Key value="D" onClick={onClick} status={charStatuses["D"]} />
        <Key value="F" onClick={onClick} status={charStatuses["F"]} />
        <Key value="G" onClick={onClick} status={charStatuses["G"]} />
        <Key value="H" onClick={onClick} status={charStatuses["H"]} />
        <Key value="J" onClick={onClick} status={charStatuses["J"]} />
        <Key value="K" onClick={onClick} status={charStatuses["K"]} />
        <Key value="L" onClick={onClick} status={charStatuses["L"]} />
      </div>
      <div className="flex justify-center">
        <Key width={65.4} value="ENTER" onClick={onClick}>
          Enter
        </Key>
        <Key value="Z" onClick={onClick} status={charStatuses["Z"]} />
        <Key value="X" onClick={onClick} status={charStatuses["X"]} />
        <Key value="C" onClick={onClick} status={charStatuses["C"]} />
        <Key value="V" onClick={onClick} status={charStatuses["V"]} />
        <Key value="B" onClick={onClick} status={charStatuses["B"]} />
        <Key value="N" onClick={onClick} status={charStatuses["N"]} />
        <Key value="M" onClick={onClick} status={charStatuses["M"]} />
        <Key width={65.4} value="DELETE" onClick={onClick}>
          Delete
        </Key>
      </div>
    </div>
  );
};
