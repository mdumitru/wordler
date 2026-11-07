import { Fragment } from "react";
import { Transition } from "@headlessui/react";

type Props = {
  isOpen: boolean;
  message: string;
  // "error" for rejected input, "info" for neutral announcements.
  variant?: "error" | "info";
};

export const Alert = ({ isOpen, message, variant = "error" }: Props) => {
  return (
    <Transition
      show={isOpen}
      as={Fragment}
      enter="ease-out duration-300 transition"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition ease-in duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      {variant === "info" ? (
        // Wordle-style toast: a compact, bold, high-contrast pill over the
        // top of the board, sized to its text.
        <div className="absolute z-20 top-20 left-1/2 transform -translate-x-1/2 px-4 py-3 rounded bg-black text-white dark:bg-white dark:text-black text-sm font-bold whitespace-nowrap pointer-events-none">
          {message}
        </div>
      ) : (
        <div className="absolute z-20 top-2.5 left-1/2 transform -translate-x-1/2 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden bg-rose-200">
          <div className="p-4">
            <p className="text-sm text-center font-medium text-gray-900">
              {message}
            </p>
          </div>
        </div>
      )}
    </Transition>
  );
};
