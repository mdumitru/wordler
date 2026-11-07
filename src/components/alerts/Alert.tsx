import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import classnames from "classnames";

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
      leave="transition ease-in duration-100"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
    >
      <div
        className={classnames(
          "absolute z-20 top-2.5 left-1/2 transform -translate-x-1/2 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden",
          variant === "info" ? "bg-gray-800" : "bg-rose-200",
        )}
      >
        <div className="p-4">
          <p
            className={classnames(
              "text-sm text-center font-medium",
              variant === "info" ? "text-white" : "text-gray-900",
            )}
          >
            {message}
          </p>
        </div>
      </div>
    </Transition>
  );
};
