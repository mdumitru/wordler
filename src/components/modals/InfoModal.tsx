import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Cell } from "../grid/Cell";
import { MAX_WORD_LENGTH, MIN_GUESSES } from "../../constants/settings";
import { getSolutionLengthRange } from "../../lib/words";

const ordinal = (n: number) => {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
};

type Props = {
  isOpen: boolean;
  handleClose: () => void;
};

export const InfoModal = ({ isOpen, handleClose }: Props) => {
  const { shortest, longest } = getSolutionLengthRange();
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="fixed z-10 inset-0 overflow-y-auto"
        onClose={handleClose}
      >
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
              <div>
                <div>
                  <Dialog.Title
                    as="h3"
                    className="text-center text-lg leading-6 font-medium text-gray-900 dark:text-white"
                  >
                    How to play
                  </Dialog.Title>
                  <div className="mt-2 space-y-3 text-sm text-gray-500 dark:text-gray-300">
                    <p>
                      Guess the hidden word. Its length is a secret: it can be
                      anywhere from {shortest} to {longest} letters, and your
                      guesses can be any English word up to {MAX_WORD_LENGTH}{" "}
                      letters long.
                    </p>
                    <p>
                      You get {MIN_GUESSES} tries, or one more try than the word
                      has letters if it is longer. If a new row appears after
                      your {ordinal(MIN_GUESSES)} guess, the word has at least{" "}
                      {MIN_GUESSES} letters.
                    </p>

                    <h4 className="pt-1 font-medium text-gray-900 dark:text-white">
                      Reading the colors
                    </h4>
                    <p>
                      Each letter is checked against the letter in the same
                      position of the word, counting from the left.
                    </p>

                    <div>
                      <div className="flex justify-center mb-1">
                        <Cell size="sm" value="W" status="correct" />
                        <Cell size="sm" value="E" />
                        <Cell size="sm" value="A" />
                        <Cell size="sm" value="R" />
                        <Cell size="sm" value="Y" />
                      </div>
                      <p>
                        <strong>W</strong> is in the word and in the correct
                        spot.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-center mb-1">
                        <Cell size="sm" value="P" />
                        <Cell size="sm" value="I" status="present" />
                        <Cell size="sm" value="L" />
                        <Cell size="sm" value="O" />
                        <Cell size="sm" value="T" />
                      </div>
                      <p>
                        <strong>I</strong> is in the word but in the wrong spot.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-center mb-1">
                        <Cell size="sm" value="V" />
                        <Cell size="sm" value="A" />
                        <Cell size="sm" value="G" />
                        <Cell size="sm" value="U" status="absent" />
                        <Cell size="sm" value="E" />
                      </div>
                      <p>
                        <strong>U</strong> is not in the word in any spot.
                      </p>
                    </div>

                    <div>
                      <div className="flex justify-center mb-1">
                        <Cell size="sm" value="C" status="correct" />
                        <Cell size="sm" value="A" status="correct" />
                        <Cell size="sm" value="T" status="correct" />
                      </div>
                      <p>
                        All green, but not a win: the word could be{" "}
                        <strong>CATALOG</strong>. Try a longer guess to find out
                        how it continues.
                      </p>
                    </div>

                    <h4 className="pt-1 font-medium text-gray-900 dark:text-white">
                      Scoring and buttons
                    </h4>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>
                        <strong>Letters used</strong> adds up every letter you
                        guess. Fewer tries is good; fewer letters is a bonus.
                      </li>
                      <li>
                        <strong>New word</strong> starts over with a random
                        word.
                      </li>
                      <li>
                        <strong>Give up</strong> ends the game and shows the
                        answer.
                      </li>
                      <li>
                        <strong>Share</strong> appears when the game ends and
                        copies a spoiler-free result to your clipboard.
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
