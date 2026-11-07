import { InformationCircleIcon } from "@heroicons/react/outline";
import { useState, useEffect } from "react";
import { Alert } from "./components/alerts/Alert";
import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { AboutModal } from "./components/modals/AboutModal";
import { InfoModal } from "./components/modals/InfoModal";
import { WinModal } from "./components/modals/WinModal";
import { MAX_WORD_LENGTH } from "./constants/settings";
import {
  isWordInWordList,
  getWordOfDay,
  getRandomWord,
  getMaxGuesses,
} from "./lib/words";

function App() {
  const [solution, setSolution] = useState(getWordOfDay);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameWon, setIsGameWon] = useState(false);
  const [hasGivenUp, setHasGivenUp] = useState(false);
  const [isWinModalOpen, setIsWinModalOpen] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isWordNotFoundAlertOpen, setIsWordNotFoundAlertOpen] = useState(false);
  const [isNotEnoughLetters, setIsNotEnoughLetters] = useState(false);

  const maxGuesses = getMaxGuesses(solution);
  const isOutOfGuesses = !isGameWon && guesses.length >= maxGuesses;

  useEffect(() => {
    if (isGameWon) {
      setIsWinModalOpen(true);
    }
  }, [isGameWon]);

  const onChar = (value: string) => {
    if (
      !hasGivenUp &&
      !isOutOfGuesses &&
      currentGuess.length < MAX_WORD_LENGTH
    ) {
      setCurrentGuess(`${currentGuess}${value}`);
    }
  };

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const onEnter = () => {
    if (hasGivenUp || isOutOfGuesses) {
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
      setGuesses([...guesses, currentGuess]);
      setCurrentGuess("");

      if (winningWord) {
        setIsGameWon(true);
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
    setHasGivenUp(false);
    setIsWinModalOpen(false);
  };

  const onGiveUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Drop focus so a later physical Enter key does not click this button again.
    e.currentTarget.blur();
    setHasGivenUp(true);
    // Reveal the answer as a final, fully-correct row on the board.
    setGuesses([...guesses, solution]);
    setCurrentGuess("");
  };

  return (
    <div className="min-h-screen flex flex-col py-8 max-w-7xl mx-auto sm:px-6 lg:px-8">
      <Alert message="Not enough letters" isOpen={isNotEnoughLetters} />
      <Alert message="Word not found" isOpen={isWordNotFoundAlertOpen} />
      <div className="flex w-80 mx-auto items-center mb-10">
        <h1 className="text-xl grow font-bold">Not Wordle</h1>
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
          disabled={isGameWon || hasGivenUp}
        >
          Give up
        </button>
        <InformationCircleIcon
          className="h-6 w-6 cursor-pointer"
          onClick={() => setIsInfoModalOpen(true)}
        />
      </div>
      <Grid
        guesses={guesses}
        currentGuess={currentGuess}
        solution={solution}
        maxGuesses={maxGuesses}
      />
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
      <WinModal
        isOpen={isWinModalOpen}
        handleClose={() => setIsWinModalOpen(false)}
        guesses={guesses}
        solution={solution}
      />
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
