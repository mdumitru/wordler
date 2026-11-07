import { CompletedRow } from "./CompletedRow";
import { CurrentRow } from "./CurrentRow";
import { EmptyRow } from "./EmptyRow";

type Props = {
  guesses: string[];
  currentGuess: string;
  solution: string;
  maxGuesses: number;
};

export const Grid = ({
  guesses,
  currentGuess,
  solution,
  maxGuesses,
}: Props) => {
  const hasGuessesLeft = guesses.length < maxGuesses;
  const empties = Array.from(
    Array(Math.max(0, maxGuesses - 1 - guesses.length)),
  );

  return (
    <div className="pb-6">
      <div className="board-scroll overflow-x-auto">
        <div className="w-max mx-auto">
          {guesses.map((guess, i) => (
            <CompletedRow key={i} guess={guess} solution={solution} />
          ))}
          {hasGuessesLeft && <CurrentRow guess={currentGuess} />}
          {empties.map((_, i) => (
            <EmptyRow key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};
