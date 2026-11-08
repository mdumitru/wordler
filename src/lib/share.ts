import { CharStatus, getGuessStatuses } from "./statuses";

const EMOJI: Record<CharStatus, string> = {
  correct: "🟩",
  present: "🟨",
  absent: "⬜",
};

export const countLetters = (guesses: string[]) =>
  guesses.reduce((total, guess) => total + guess.length, 0);

// Spoiler-free result: a score line followed by one emoji row per guess. The
// guess limit is left out because it would give away the word's length.
export const getShareText = (
  guesses: string[],
  solution: string,
  isGameWon: boolean,
) => {
  const score = isGameWon ? guesses.length : "X";
  const rows = guesses.map((guess) =>
    getGuessStatuses(guess, solution)
      .map((status) => EMOJI[status])
      .join(""),
  );
  const letters = countLetters(guesses);
  const header = `Wordler ${score} · ${letters} ${
    letters === 1 ? "letter" : "letters"
  }`;
  return [header, "", ...rows].join("\n");
};

// Copies through a temporary textarea: the only option outside secure
// contexts (e.g. plain HTTP on a LAN address), where navigator.clipboard is
// missing.
const copyWithTextarea = (text: string) => {
  const previousFocus = document.activeElement;
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "0";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  try {
    textarea.select();
    if (!document.execCommand("copy")) {
      throw new Error("execCommand('copy') was refused");
    }
  } finally {
    document.body.removeChild(textarea);
    if (previousFocus instanceof HTMLElement) {
      previousFocus.focus();
    }
  }
};

export type ShareOutcome = "shared" | "copied" | "cancelled";

// Native share sheet where there is one (mobile), else the clipboard.
export const shareText = async (text: string): Promise<ShareOutcome> => {
  if (typeof navigator.share === "function") {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        return "cancelled";
      }
      console.warn("Native share failed, copying instead", err);
    }
  }
  if (window.isSecureContext && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
  } else {
    copyWithTextarea(text);
  }
  return "copied";
};
