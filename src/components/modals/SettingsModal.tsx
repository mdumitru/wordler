import { Fragment } from "react";
import { Dialog, Switch, Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/outline";
import { Mode, MODES } from "../../lib/mode";
import { Theme } from "../../lib/theme";

const MODE_LABELS: Record<Mode, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  mode: Mode;
  onModeChange: (mode: Mode) => void;
  theme: Theme;
  onToggleTheme: () => void;
};

export const SettingsModal = ({
  isOpen,
  handleClose,
  mode,
  onModeChange,
  theme,
  onToggleTheme,
}: Props) => {
  const isDark = theme === "dark";
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
            <div className="relative inline-block align-bottom w-full bg-white dark:bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:p-6">
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                aria-label="Close"
                onClick={handleClose}
              >
                <XIcon className="h-5 w-5" />
              </button>
              <Dialog.Title
                as="h3"
                className="text-center text-lg leading-6 font-medium text-gray-900 dark:text-white"
              >
                Settings
              </Dialog.Title>

              <div className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
                <div className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p
                      id="settings-difficulty"
                      className="text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Difficulty
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hard can only be turned on at the start of a round
                    </p>
                  </div>
                  <div
                    role="group"
                    aria-labelledby="settings-difficulty"
                    className="flex shrink-0 rounded overflow-hidden border border-indigo-200 dark:border-indigo-800"
                  >
                    {MODES.map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={mode === m}
                        className={`px-2.5 py-1 text-xs font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 ${
                          mode === m
                            ? "text-white bg-indigo-600 dark:bg-indigo-500"
                            : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-100 dark:bg-gray-800 dark:hover:bg-indigo-900"
                        }`}
                        onClick={() => onModeChange(m)}
                      >
                        {MODE_LABELS[m]}
                      </button>
                    ))}
                  </div>
                </div>

                <Switch.Group
                  as="div"
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <Switch.Label className="text-sm font-medium text-gray-900 dark:text-white">
                    Dark theme
                  </Switch.Label>
                  <Switch
                    checked={isDark}
                    onChange={onToggleTheme}
                    className={`${
                      isDark ? "bg-indigo-500" : "bg-gray-300"
                    } relative inline-flex shrink-0 h-6 w-11 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500 dark:focus-visible:ring-offset-gray-800`}
                  >
                    <span
                      aria-hidden="true"
                      className={`${
                        isDark ? "translate-x-6" : "translate-x-1"
                      } inline-block h-4 w-4 mt-1 rounded-full bg-white transform transition-transform`}
                    />
                  </Switch>
                </Switch.Group>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
