import { MiniCompletedRow } from "./MiniCompletedRow";

type Props = {
  guesses: string[];
};

export const MiniGrid = ({ guesses }: Props) => {
  return (
    <div className="pb-6 w-max mx-auto">
      {guesses.map((guess, i) => (
        <MiniCompletedRow key={i} guess={guess} />
      ))}
    </div>
  );
};
