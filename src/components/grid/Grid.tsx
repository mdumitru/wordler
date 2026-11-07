import { MAX_CHALLENGES } from "../../constants/settings";
import { CompletedRow } from "./CompletedRow";
import { CurrentRow } from "./CurrentRow";
import { EmptyRow } from "./EmptyRow";

type Props = {
  guesses: string[];
  currentGuess: string;
  solution: string;
};

export const Grid = ({ guesses, currentGuess, solution }: Props) => {
  const empties =
    guesses.length < MAX_CHALLENGES - 1
      ? Array.from(Array(MAX_CHALLENGES - 1 - guesses.length))
      : [];

  return (
    <div className="pb-6 overflow-x-auto">
      <div className="w-max mx-auto">
        {guesses.map((guess, i) => (
          <CompletedRow key={i} guess={guess} solution={solution} />
        ))}
        {guesses.length < MAX_CHALLENGES && <CurrentRow guess={currentGuess} />}
        {empties.map((_, i) => (
          <EmptyRow key={i} />
        ))}
      </div>
    </div>
  );
};
