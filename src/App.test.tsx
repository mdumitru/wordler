import { act, fireEvent, render, screen } from "@testing-library/react";
import { readFileSync } from "fs";
import { join } from "path";
import App from "./App";

const wordFile = (name: string) =>
  readFileSync(join(__dirname, "../public/words", name), "utf8");
const WORD_FILES: Record<string, string> = {
  "/words/solutions.txt": wordFile("solutions.txt"),
  "/words/guesses.txt": wordFile("guesses.txt"),
};

jest.mock("./lib/words", () => ({
  ...jest.requireActual("./lib/words"),
  getWordOfDay: () => "CAT",
  getRandomWord: () => "DOG",
}));

const press = (key: string) => {
  const code = key === "Enter" || key === "Backspace" ? key : `Key${key}`;
  act(() => {
    fireEvent.keyDown(window, { key, code });
    fireEvent.keyUp(window, { key, code });
  });
};

const type = (word: string) => word.split("").forEach((c) => press(c));

const submit = (word: string) => {
  type(word);
  press("Enter");
};

const board = () => screen.getByTestId("board");

// The visible toast; the screen-reader live region repeats its text.
const TOAST = { selector: '[aria-hidden="true"]' };
const toast = (text: string) => screen.getByText(text, TOAST);
const queryToast = (text: string) => screen.queryByText(text, TOAST);

const mockFetch = (fail = false) => {
  window.fetch = jest.fn((url: RequestInfo) => {
    const body = WORD_FILES[String(url)];
    return Promise.resolve({
      ok: !fail && body !== undefined,
      status: fail ? 503 : 200,
      text: () => Promise.resolve(body ?? ""),
    } as Response);
  });
};

// Renders the app and waits for the word lists to arrive.
const renderGame = async () => {
  const result = render(<App />);
  await screen.findByTestId("board");
  return result;
};

beforeEach(() => {
  jest.useFakeTimers();
  window.localStorage.clear();
  mockFetch();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test("typing after a win changes nothing and the input row is gone", async () => {
  await renderGame();
  submit("CAT");
  const rowsAfterWin = board().children.length;
  type("DOG");
  expect(board()).not.toHaveTextContent("D");
  expect(board().children.length).toBe(rowsAfterWin);
  // Six rows: the winning guess plus five placeholder rows, no input row.
  expect(rowsAfterWin).toBe(6);
});

test("typing after giving up changes nothing", async () => {
  await renderGame();
  type("CO");
  fireEvent.click(screen.getByText("Give up"));
  type("DOG");
  press("Enter");
  expect(board().textContent).toBe("");
});

test("New word never shows the new answer in the fading toast", async () => {
  await renderGame();
  fireEvent.click(screen.getByText("Give up"));
  act(() => {
    jest.advanceTimersByTime(10);
  });
  expect(toast("The word was CAT")).toBeInTheDocument();
  fireEvent.click(screen.getByText("New word"));
  expect(queryToast("The word was DOG")).not.toBeInTheDocument();
  expect(toast("The word was CAT")).toBeInTheDocument();
});

test("a repeated invalid Enter keeps the toast up for 2s after the last press", async () => {
  await renderGame();
  type("ZZZ");
  press("Enter");
  act(() => {
    jest.advanceTimersByTime(1500);
  });
  press("Enter");
  act(() => {
    jest.advanceTimersByTime(1900);
  });
  expect(toast("Word not found")).toBeInTheDocument();
});

test("guesses shorter than three letters are not enough", async () => {
  await renderGame();
  type("CA");
  press("Enter");
  expect(toast("Not enough letters")).toBeInTheDocument();
  expect(screen.getByRole("status")).toHaveTextContent("Not enough letters");
});

test("tiles, rows and keys have accessible names", async () => {
  await renderGame();
  submit("COT");
  expect(screen.getByRole("group", { name: "Guess: COT" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "C correct" })).toBeInTheDocument();
  expect(screen.getByRole("img", { name: "O absent" })).toBeInTheDocument();
  act(() => {
    jest.runOnlyPendingTimers();
  });
  expect(
    screen.getByRole("button", { name: "C, correct" }),
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Enter" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "How to play" }),
  ).toBeInTheDocument();
});

const keyDown = (init: KeyboardEventInit) =>
  act(() => {
    fireEvent.keyDown(window, init);
  });

test("holding Backspace keeps deleting", async () => {
  await renderGame();
  type("COT");
  keyDown({ key: "Backspace", code: "Backspace" });
  keyDown({ key: "Backspace", code: "Backspace", repeat: true });
  expect(board().textContent).toBe("C");
});

test("numpad Enter submits, a held Enter does not", async () => {
  await renderGame();
  type("CAT");
  keyDown({ key: "Enter", code: "Enter", repeat: true });
  expect(screen.getByText("Give up")).toBeEnabled();
  keyDown({ key: "Enter", code: "NumpadEnter" });
  expect(screen.getByText("Give up")).toBeDisabled();
});

test("keys do nothing while a modal is open; Enter submits after it closes", async () => {
  await renderGame();
  type("CA");
  // A mouse click focuses the button in Chrome, then opens the modal.
  screen.getByText("About this game").focus();
  fireEvent.click(screen.getByText("About this game"));
  type("T");
  press("Enter");
  expect(board().textContent).toBe("CA");
  press("Escape");
  for (let i = 0; i < 5; i++) {
    act(() => {
      jest.advanceTimersByTime(500);
    });
  }
  expect(document.activeElement).toBe(screen.getByText("About this game"));
  type("T");
  press("Enter");
  expect(screen.getByText("Give up")).toBeDisabled();
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("listeners are attached once, not on every render", async () => {
  const add = jest.spyOn(window, "addEventListener");
  await renderGame();
  type("COT");
  expect(add.mock.calls.filter(([type]) => type === "keydown").length).toBe(1);
  add.mockRestore();
});

test("refreshing mid-game restores the board without a toast", async () => {
  const { unmount } = await renderGame();
  submit("COT");
  type("CA");
  unmount();
  await renderGame();
  expect(board().textContent).toBe("COT");
  expect(screen.getByText("Give up")).toBeEnabled();
});

test("refreshing a finished game restores it with Share and no toast", async () => {
  const { unmount } = await renderGame();
  submit("COT");
  submit("CAT");
  act(() => {
    jest.runOnlyPendingTimers();
  });
  unmount();
  await renderGame();
  expect(board().textContent).toBe("COTCAT");
  expect(screen.getByText("Give up")).toBeDisabled();
  expect(queryToast("Great!")).not.toBeInTheDocument();
  act(() => {
    jest.advanceTimersByTime(5000);
  });
  expect(queryToast("Great!")).not.toBeInTheDocument();
  expect(screen.getByText("Share")).toBeInTheDocument();
});

test("a saved word that left the solution list is discarded", async () => {
  window.localStorage.setItem(
    "game",
    JSON.stringify({
      solution: "QWXZ",
      guesses: ["COT"],
      isGameWon: false,
      isAnswerRevealed: false,
    }),
  );
  await renderGame();
  expect(board().textContent).toBe("");
});
