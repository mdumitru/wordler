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
  areWordsLoaded,
  loadWords,
} from "./lib/words";
import { loadGame, SavedGame, saveGame } from "./lib/storage";
import {
  findHardModeViolation,
  loadMode,
  Mode,
  MODES,
  saveMode,
} from "./lib/mode";
import { getTheme, setTheme, Theme, watchSystemTheme } from "./lib/theme";
import { countLetters, getShareText, shareText } from "./lib/share";
import {
  getRowBounceMs,
  getRowRevealMs,
  prefersReducedMotion,
} from "./lib/reveal";

const ANSWER_TOAST_MS = 5000;
const WIN_TOAST_MS = 2000;
const ERROR_TOAST_MS = 2000;
const SHARE_LABEL_MS = 2000;
const LENGTH_TOAST_MS = 3000;

const MODE_LABELS: Record<Mode, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

// The saved game, unless its word has since left the solution list.
const loadRestorableGame = (): SavedGame | null => {
  const saved = loadGame();
  return saved && isSolution(saved.solution) ? saved : null;
};

function Game() {
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

  const [mode, setModeState] = useState<Mode>(loadMode);
  const [theme, setThemeState] = useState<Theme>(getTheme);
  useEffect(() => watchSystemTheme(setThemeState), []);
  const [shareLabel, setShareLabel] = useState("Share");
  // Share and the answer toast wait until the board's final animations end.
  const [isEndAnimationDone, setIsEndAnimationDone] =
    useState(isRestoredGameOver);
  const [endAnimationMs, setEndAnimationMs] = useState(0);
  // One toast at a time; a closing toast keeps its text while it fades out.
  const [toast, setToast] = useState({ message: "", isOpen: false });
  const toastTimerRef = useRef<number>();
  const shareTimerRef = useRef<number>();
  const lengthToastTimerRef = useRef<number>();

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
      window.clearTimeout(lengthToastTimerRef.current);
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

    if (mode === "hard") {
      const violation = findHardModeViolation(currentGuess, guesses, solution);
      if (violation) {
        return showToast(violation, ERROR_TOAST_MS);
      }
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
    } else if (
      mode === "easy" &&
      guess.length === solution.length &&
      !guesses.some((g) => g.length === solution.length)
    ) {
      // Announce the first guess of the right length once its row is shown.
      window.clearTimeout(lengthToastTimerRef.current);
      lengthToastTimerRef.current = window.setTimeout(
        () =>
          showToast(
            `Right length! The word has ${solution.length} letters`,
            LENGTH_TOAST_MS,
          ),
        prefersReducedMotion() ? 0 : getRowRevealMs(guess.length),
      );
    }
  };

  const onModeChange = (next: Mode) => {
    if (next === mode) {
      return;
    }
    // As in Wordle, hard mode cannot be switched on partway through a round.
    if (next === "hard" && guesses.length > 0 && !isGameOver) {
      return showToast(
        "Hard mode can only be turned on at the start of a round",
        ERROR_TOAST_MS,
      );
    }
    saveMode(next);
    setModeState(next);
  };

  const onNewWord = () => {
    skipEndToastRef.current = false;
    hideToast();
    window.clearTimeout(shareTimerRef.current);
    window.clearTimeout(lengthToastTimerRef.current);
    setShareLabel("Share");
    setSolution(getRandomWord(solution));
    setGuesses([]);
    setCurrentGuess("");
    setIsGameWon(false);
    setIsAnswerRevealed(false);
  };

  const onGiveUp = () => {
    window.clearTimeout(lengthToastTimerRef.current);
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
    const text = getShareText(guesses, solution, isGameWon);
    let label = "Share";
    try {
      const outcome = await shareText(text);
      label =
        outcome === "copied"
          ? "Copied!"
          : outcome === "shared"
            ? "Shared!"
            : "Share";
    } catch (err) {
      console.error("Could not copy share text", err);
      label = "Copy failed";
    }
    setShareLabel(label);
    window.clearTimeout(shareTimerRef.current);
    shareTimerRef.current = window.setTimeout(
      () => setShareLabel("Share"),
      SHARE_LABEL_MS,
    );
  };

  return (
    <div className="app-height flex flex-col py-4 sm:py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <Alert message={toast.message} isOpen={toast.isOpen} />
      <div className="flex w-full max-w-[28rem] mx-auto items-center mb-4 px-2 sm:px-0">
        <Logo />
        <button
          type="button"
          className="shrink-0 whitespace-nowrap mr-1 sm:mr-2 px-1.5 sm:px-2.5 py-1.5 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:focus-visible:ring-offset-wordle-night-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          onClick={onNewWord}
        >
          New word
        </button>
        <button
          type="button"
          className="shrink-0 whitespace-nowrap mr-1 sm:mr-2 px-1.5 sm:px-2.5 py-1.5 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:focus-visible:ring-offset-wordle-night-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onGiveUp}
          disabled={isGameWon || isAnswerRevealed}
        >
          Give up
        </button>
        <button
          type="button"
          className="shrink-0 mr-1 sm:mr-2"
          onClick={onToggleTheme}
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          ) : (
            <MoonIcon className="h-5 w-5 sm:h-6 sm:w-6" />
          )}
        </button>
        <button
          type="button"
          className="shrink-0"
          aria-label="How to play"
          onClick={() => setIsInfoModalOpen(true)}
        >
          <InformationCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>
      <div
        role="group"
        aria-label="Mode"
        className="flex mx-auto mb-2 rounded overflow-hidden border border-indigo-200 dark:border-indigo-800"
      >
        {MODES.map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            className={`px-2.5 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
              mode === m
                ? "text-white bg-indigo-600 dark:bg-indigo-500"
                : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-100 dark:bg-wordle-night-bg dark:hover:bg-indigo-900"
            }`}
            onClick={() => onModeChange(m)}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
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
        highlightLength={mode === "easy"}
      />
      {/* Always rendered so the board and keyboard do not jump when it appears. */}
      <button
        type="button"
        className={`${isEndAnimationDone ? "" : "invisible "}shrink-0 mx-auto px-4 py-2 text-sm font-medium rounded text-white bg-wordle-correct hover:bg-wordle-night-correct dark:bg-wordle-night-correct dark:hover:bg-wordle-correct focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-wordle-correct dark:focus-visible:ring-offset-wordle-night-bg`}
        onClick={onShare}
        disabled={!isEndAnimationDone}
      >
        {shareLabel}
      </button>
      {/* mt-auto pins the keyboard toward the bottom; pt-10 keeps a gap when the page is short. */}
      <div className="mt-auto pt-4 sm:pt-10">
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
        className="shrink-0 mx-auto mt-4 sm:mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-100 dark:bg-indigo-900 dark:hover:bg-indigo-800 dark:focus-visible:ring-offset-wordle-night-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
        onClick={() => setIsAboutModalOpen(true)}
      >
        About this game
      </button>
    </div>
  );
}

type LoadState = "loading" | "ready" | "error";

// Fetches the word lists, then starts the game.
function App() {
  const [loadState, setLoadState] = useState<LoadState>(() =>
    areWordsLoaded() ? "ready" : "loading",
  );

  const load = useCallback(() => {
    setLoadState("loading");
    loadWords().then(
      () => setLoadState("ready"),
      (err) => {
        console.error("Could not load the word lists", err);
        setLoadState("error");
      },
    );
  }, []);

  useEffect(() => {
    if (!areWordsLoaded()) {
      load();
    }
  }, [load]);

  if (loadState === "ready") {
    return <Game />;
  }
  return (
    <div className="app-height flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div>
        <Logo />
      </div>
      {loadState === "loading" ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading words…
        </p>
      ) : (
        <>
          <p role="alert" className="text-sm font-bold">
            Could not load the word list. Check your connection and try again.
          </p>
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium rounded text-white bg-wordle-correct hover:bg-wordle-night-correct dark:bg-wordle-night-correct dark:hover:bg-wordle-correct focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-wordle-correct dark:focus-visible:ring-offset-wordle-night-bg"
            onClick={load}
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}

export default App;
