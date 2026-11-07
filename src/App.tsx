import { InformationCircleIcon } from "@heroicons/react/outline";
import { useEffect, useState } from "react";
import { Alert } from "./components/alerts/Alert";
import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { AboutModal } from "./components/modals/AboutModal";
import { InfoModal } from "./components/modals/InfoModal";
import { MAX_WORD_LENGTH } from "./constants/settings";
import {
  isWordInWordList,
  getWordOfDay,
  getRandomWord,
  getMaxGuesses,
} from "./lib/words";
import { countLetters, getShareText } from "./lib/share";
import {
  getRowBounceMs,
  getRowRevealMs,
  prefersReducedMotion,
} from "./lib/reveal";

const ANSWER_TOAST_MS = 5000;

function App() {
  const [solution, setSolution] = useState(getWordOfDay);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameWon, setIsGameWon] = useState(false);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false);
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false);

  const [shareLabel, setShareLabel] = useState("Share");
  // Share and the answer toast wait until the board's final animations end.
  const [isEndAnimationDone, setIsEndAnimationDone] = useState(false);
  const [endAnimationMs, setEndAnimationMs] = useState(0);
  const [isAnswerToastOpen, setIsAnswerToastOpen] = useState(false);

  const maxGuesses = getMaxGuesses(solution);
  const isGameOver = isGameWon || isAnswerRevealed;
  const lettersUsed = countLetters(guesses);

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
    if (!isAnswerRevealed || !isEndAnimationDone) {
      setIsAnswerToastOpen(false);
      return;
    }
    setIsAnswerToastOpen(true);
    const timer = setTimeout(
      () => setIsAnswerToastOpen(false),
      ANSWER_TOAST_MS,
    );
    return () => clearTimeout(timer);
  }, [isAnswerRevealed, isEndAnimationDone]);

  const onChar = (value: string) => {
    if (!isAnswerRevealed && currentGuess.length < MAX_WORD_LENGTH) {
      setCurrentGuess(`${currentGuess}${value}`);
    }
  };

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const onEnter = () => {
    if (isAnswerRevealed) {
      return;
    }

    if (currentGuess.length === 0) {
      setIsNotEnoughLetters(true);
      return setTimeout(() => {
        setIsNotEnoughLetters(false);
      }, 2000);
    }

    if (!isWordInWordList(currentGuess)) {
      setIsWordNotFoundAlertOpen(true);
      return setTimeout(() => {
        setIsWordNotFoundAlertOpen(false);
      }, 2000);
    }

    const winningWord = currentGuess === solution;

    if (!isGameWon) {
      setCurrentGuess("");

      if (winningWord) {
        setEndAnimationMs(
          getRowRevealMs(currentGuess.length) +
            getRowBounceMs(currentGuess.length),
        );
        setGuesses([...guesses, currentGuess]);
        setIsGameWon(true);
      } else if (guesses.length + 1 >= maxGuesses) {
        // Out of guesses: the answer toast follows the last row's reveal.
        setEndAnimationMs(getRowRevealMs(currentGuess.length));
        setGuesses([...guesses, currentGuess]);
        setIsAnswerRevealed(true);
      } else {
        setGuesses([...guesses, currentGuess]);
      }
    }
  };

  const onNewWord = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Drop focus so a later physical Enter key does not click this button again.
    e.currentTarget.blur();
    setSolution(getRandomWord(solution));
    setGuesses([]);
    setCurrentGuess("");
    setIsGameWon(false);
    setIsAnswerRevealed(false);
  };

  const onGiveUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Drop focus so a later physical Enter key does not click this button again.
    e.currentTarget.blur();
    setEndAnimationMs(0);
    setIsAnswerRevealed(true);
    setCurrentGuess("");
  };

  const onShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    // Drop focus so a later physical Enter key does not click this button again.
    e.currentTarget.blur();
    const text = getShareText(guesses, solution, maxGuesses, isGameWon);
    try {
      await navigator.clipboard.writeText(text);
      setShareLabel("Copied!");
    } catch (err) {
      console.error("Could not copy share text", err);
      setShareLabel("Copy failed");
    }
    setTimeout(() => setShareLabel("Share"), 2000);
  };

  return (
    <div className="h-screen flex flex-col py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <Alert message="Not enough letters" isOpen={isNotEnoughLetters} />
      <Alert message="Word not found" isOpen={isWordNotFoundAlertOpen} />
      <Alert
        message={`The word was ${solution}`}
        isOpen={isAnswerToastOpen}
        variant="info"
      />
      <div className="flex w-80 mx-auto items-center mb-4">
        <h1 className="text-xl grow font-bold">Wordler</h1>
        <button
          type="button"
          className="mr-3 px-2.5 py-1.5 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={onNewWord}
        >
          New word
        </button>
        <button
          type="button"
          className="mr-3 px-2.5 py-1.5 text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onGiveUp}
          disabled={isGameWon || isAnswerRevealed}
        >
          Give up
        </button>
        <InformationCircleIcon
          className="h-6 w-6 cursor-pointer"
          onClick={() => setIsInfoModalOpen(true)}
        />
      </div>
      <p className="text-center text-sm text-gray-500">
        Letters used: <span className="font-bold">{lettersUsed}</span>
      </p>
      <Grid
        guesses={guesses}
        currentGuess={currentGuess}
        solution={solution}
        maxGuesses={maxGuesses}
        isGameWon={isGameWon}
      />
      {isEndAnimationDone && (
        <button
          type="button"
          className="mx-auto px-4 py-2 text-sm font-medium rounded text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
          guesses={guesses}
          solution={solution}
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
        className="mx-auto mt-8 flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        onClick={() => setIsAboutModalOpen(true)}
      >
        About this game
      </button>
    </div>
  );
}

export default App;
