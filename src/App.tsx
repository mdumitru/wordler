import {
  InformationCircleIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/outline";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "./components/alerts/Alert";
import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { Logo } from "./components/logo/Logo";
import { AboutModal } from "./components/modals/AboutModal";
import { InfoModal } from "./components/modals/InfoModal";
import { MAX_WORD_LENGTH, MIN_WORD_LENGTH } from "./constants/settings";
import {
  isWordInWordList,
  getWordOfDay,
  getRandomWord,
  getMaxGuesses,
  isSolution,
} from "./lib/words";
import { loadGame, SavedGame, saveGame } from "./lib/storage";
import { getTheme, setTheme, Theme } from "./lib/theme";
import { countLetters, getShareText } from "./lib/share";
import {
  getRowBounceMs,
  getRowRevealMs,
  prefersReducedMotion,
} from "./lib/reveal";

const ANSWER_TOAST_MS = 5000;
const WIN_TOAST_MS = 2000;
const ERROR_TOAST_MS = 2000;
const SHARE_LABEL_MS = 2000;

// The saved game, unless its word has since left the solution list.
const loadRestorableGame = (): SavedGame | null => {
  const saved = loadGame();
  return saved && isSolution(saved.solution) ? saved : null;
};

function App() {
  const [initialGame] = useState(loadRestorableGame);
  const isRestoredGameOver = Boolean(
    initialGame && (initialGame.isGameWon || initialGame.isAnswerRevealed),
  );
  const [solution, setSolution] = useState(
    () => initialGame?.solution ?? getWordOfDay(),
  );
  const [guesses, setGuesses] = useState<string[]>(
    () => initialGame?.guesses ?? [],
  );
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameWon, setIsGameWon] = useState(
    () => initialGame?.isGameWon ?? false,
  );
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(
    () => initialGame?.isAnswerRevealed ?? false,
  );
  // A finished game restored from storage shows its result without toasts.
  const skipEndToastRef = useRef(isRestoredGameOver);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  // The answer as it was when revealed, so a fading toast never shows the
  // next word after New word.
  const [revealedAnswer, setRevealedAnswer] = useState(() =>
    initialGame?.isAnswerRevealed ? initialGame.solution : "",
  );

  const [theme, setThemeState] = useState<Theme>(getTheme);
  const [shareLabel, setShareLabel] = useState("Share");
  // Share and the answer toast wait until the board's final animations end.
  const [isEndAnimationDone, setIsEndAnimationDone] =
    useState(isRestoredGameOver);
  const [endAnimationMs, setEndAnimationMs] = useState(0);
  // One toast at a time; a closing toast keeps its text while it fades out.
  const [toast, setToast] = useState({ message: "", isOpen: false });
  const toastTimerRef = useRef<number>();
  const shareTimerRef = useRef<number>();

  const showToast = useCallback((message: string, ms: number) => {
    window.clearTimeout(toastTimerRef.current);
    setToast({ message, isOpen: true });
    toastTimerRef.current = window.setTimeout(
      () => setToast((t) => ({ ...t, isOpen: false })),
      ms,
    );
  }, []);

  const hideToast = useCallback(() => {
    window.clearTimeout(toastTimerRef.current);
    setToast((t) => ({ ...t, isOpen: false }));
  }, []);

  useEffect(() => {
    saveGame({ solution, guesses, isGameWon, isAnswerRevealed });
  }, [solution, guesses, isGameWon, isAnswerRevealed]);

  useEffect(
    () => () => {
      window.clearTimeout(toastTimerRef.current);
      window.clearTimeout(shareTimerRef.current);
    },
    [],
  );

  const maxGuesses = getMaxGuesses(solution);
  const isGameOver = isGameWon || isAnswerRevealed;
  const lettersUsed = countLetters(guesses);

  // Cheer as the winning row finishes flipping, while its tiles bounce.
  useEffect(() => {
    if (!isGameWon || skipEndToastRef.current) {
      return;
    }
    const winningGuess = guesses[guesses.length - 1];
    const revealMs = prefersReducedMotion()
      ? 0
      : getRowRevealMs(winningGuess.length);
    const timer = setTimeout(() => showToast("Great!", WIN_TOAST_MS), revealMs);
    return () => clearTimeout(timer);
    // Only (re)schedule when the game is won, not on later guess changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameWon]);

  // Guesses whose tile reveal has finished; the keyboard only colours these.
  const [revealedCount, setRevealedCount] = useState(guesses.length);

  useEffect(() => {
    if (guesses.length <= revealedCount) {
      // A new word cleared the board: reset straight away.
      setRevealedCount(guesses.length);
      return;
    }
    const lastGuess = guesses[guesses.length - 1];
    const timer = setTimeout(
      () => setRevealedCount(guesses.length),
      prefersReducedMotion() ? 0 : getRowRevealMs(lastGuess.length),
    );
    return () => clearTimeout(timer);
  }, [guesses, revealedCount]);

  useEffect(() => {
    if (!isGameOver) {
      setIsEndAnimationDone(false);
      return;
    }
    const timer = setTimeout(
      () => setIsEndAnimationDone(true),
      prefersReducedMotion() ? 0 : endAnimationMs,
    );
    return () => clearTimeout(timer);
  }, [isGameOver, endAnimationMs]);

  useEffect(() => {
    if (isAnswerRevealed && isEndAnimationDone && !skipEndToastRef.current) {
      showToast(`The word was ${revealedAnswer}`, ANSWER_TOAST_MS);
    }
  }, [isAnswerRevealed, isEndAnimationDone, revealedAnswer, showToast]);

  const onChar = (value: string) => {
    if (isGameOver) {
      return;
    }
    setCurrentGuess((guess) =>
      guess.length < MAX_WORD_LENGTH ? `${guess}${value}` : guess,
    );
  };

  const onDelete = () => {
    if (isGameOver) {
      return;
    }
    setCurrentGuess((guess) => guess.slice(0, -1));
  };

  const onEnter = () => {
    if (isGameOver) {
      return;
    }

    if (currentGuess.length < MIN_WORD_LENGTH) {
      return showToast("Not enough letters", ERROR_TOAST_MS);
    }

    if (!isWordInWordList(currentGuess)) {
      return showToast("Word not found", ERROR_TOAST_MS);
    }

    const guess = currentGuess;
    setCurrentGuess("");
    setGuesses((prev) => [...prev, guess]);

    if (guess === solution) {
      setEndAnimationMs(
        getRowRevealMs(guess.length) + getRowBounceMs(guess.length),
      );
      setIsGameWon(true);
    } else if (guesses.length + 1 >= maxGuesses) {
      // Out of guesses: the answer toast follows the last row's reveal.
      setEndAnimationMs(getRowRevealMs(guess.length));
      setRevealedAnswer(solution);
      setIsAnswerRevealed(true);
    }
  };

  const onNewWord = () => {
    skipEndToastRef.current = false;
    hideToast();
    window.clearTimeout(shareTimerRef.current);
    setShareLabel("Share");
    setSolution(getRandomWord(solution));
    setGuesses([]);
    setCurrentGuess("");
    setIsGameWon(false);
    setIsAnswerRevealed(false);
  };

  const onGiveUp = () => {
    setEndAnimationMs(0);
    setRevealedAnswer(solution);
    setIsAnswerRevealed(true);
    setCurrentGuess("");
  };

  const onToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  };

  const onShare = async () => {
    const text = getShareText(guesses, solution, maxGuesses, isGameWon);
    try {
      await navigator.clipboard.writeText(text);
      setShareLabel("Copied!");
    } catch (err) {
      console.error("Could not copy share text", err);
      setShareLabel("Copy failed");
    }
    window.clearTimeout(shareTimerRef.current);
    shareTimerRef.current = window.setTimeout(
      () => setShareLabel("Share"),
      SHARE_LABEL_MS,
    );
  };

  return (
    <div className="h-screen flex flex-col py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <Alert message={toast.message} isOpen={toast.isOpen} />
      <div className="flex w-full max-w-[28rem] mx-auto items-center mb-4">
        <Logo />
        <button
          type="button"
          className="mr-2 px-2.5 py-1.5 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:focus:ring-offset-wordle-night-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={onNewWord}
        >
          New word
        </button>
        <button
          type="button"
          className="mr-2 px-2.5 py-1.5 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:focus:ring-offset-wordle-night-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onGiveUp}
          disabled={isGameWon || isAnswerRevealed}
        >
          Give up
        </button>
        <button
          type="button"
          className="mr-2"
          onClick={onToggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <SunIcon className="h-6 w-6" />
          ) : (
            <MoonIcon className="h-6 w-6" />
          )}
        </button>
        <InformationCircleIcon
          className="h-6 w-6 cursor-pointer"
          onClick={() => setIsInfoModalOpen(true)}
        />
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400">
        Letters used: <span className="font-bold">{lettersUsed}</span>
      </p>
      <Grid
        guesses={guesses}
        currentGuess={currentGuess}
        solution={solution}
        maxGuesses={maxGuesses}
        isGameWon={isGameWon}
        isGameOver={isGameOver}
      />
      {isEndAnimationDone && (
        <button
          type="button"
          className="mx-auto px-4 py-2 text-sm font-medium rounded text-white bg-wordle-correct hover:bg-wordle-night-correct dark:bg-wordle-night-correct dark:hover:bg-wordle-correct focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-wordle-correct dark:focus:ring-offset-wordle-night-bg"
          onClick={onShare}
        >
          {shareLabel}
        </button>
      )}
      {/* mt-auto pins the keyboard toward the bottom; pt-10 keeps a gap when the page is short. */}
      <div className="mt-auto pt-10">
        <Keyboard
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
          guesses={guesses.slice(0, revealedCount)}
          solution={solution}
          isInputDisabled={isInfoModalOpen || isAboutModalOpen}
        />
      </div>
      <InfoModal
        isOpen={isInfoModalOpen}
        handleClose={() => setIsInfoModalOpen(false)}
      />
      <AboutModal
        isOpen={isAboutModalOpen}
        handleClose={() => setIsAboutModalOpen(false)}
      />

      <button
        type="button"
        className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:focus:ring-offset-wordle-night-bg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsAboutModalOpen(true)}
      >
        About this game
      </button>
    </div>
  );
}

export default App;
