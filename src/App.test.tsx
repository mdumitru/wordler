import { act, fireEvent, render, screen } from "@testing-library/react";
import App from "./App";

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

beforeEach(() => {
  jest.useFakeTimers();
  window.localStorage.clear();
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
});

test("typing after a win changes nothing and the input row is gone", () => {
  render(<App />);
  submit("CAT");
  const rowsAfterWin = board().children.length;
  type("DOG");
  expect(board()).not.toHaveTextContent("D");
  expect(board().children.length).toBe(rowsAfterWin);
  // Six rows: the winning guess plus five placeholder rows, no input row.
  expect(rowsAfterWin).toBe(6);
});

test("typing after giving up changes nothing", () => {
  render(<App />);
  type("CO");
  fireEvent.click(screen.getByText("Give up"));
  type("DOG");
  press("Enter");
  expect(board().textContent).toBe("");
});

test("New word never shows the new answer in the fading toast", () => {
  render(<App />);
  fireEvent.click(screen.getByText("Give up"));
  act(() => {
    jest.advanceTimersByTime(10);
  });
  expect(screen.getByText("The word was CAT")).toBeInTheDocument();
  fireEvent.click(screen.getByText("New word"));
  expect(screen.queryByText("The word was DOG")).not.toBeInTheDocument();
  expect(screen.getByText("The word was CAT")).toBeInTheDocument();
});

test("a repeated invalid Enter keeps the toast up for 2s after the last press", () => {
  render(<App />);
  type("ZZZ");
  press("Enter");
  act(() => {
    jest.advanceTimersByTime(1500);
  });
  press("Enter");
  act(() => {
    jest.advanceTimersByTime(1900);
  });
  expect(screen.getByText("Word not found")).toBeInTheDocument();
});

test("guesses shorter than three letters are not enough", () => {
  render(<App />);
  type("CA");
  press("Enter");
  expect(screen.getByText("Not enough letters")).toBeInTheDocument();
});

const keyDown = (init: KeyboardEventInit) =>
  act(() => {
    fireEvent.keyDown(window, init);
  });

test("holding Backspace keeps deleting", () => {
  render(<App />);
  type("COT");
  keyDown({ key: "Backspace", code: "Backspace" });
  keyDown({ key: "Backspace", code: "Backspace", repeat: true });
  expect(board().textContent).toBe("C");
});

test("numpad Enter submits, a held Enter does not", () => {
  render(<App />);
  type("CAT");
  keyDown({ key: "Enter", code: "Enter", repeat: true });
  expect(screen.getByText("Give up")).toBeEnabled();
  keyDown({ key: "Enter", code: "NumpadEnter" });
  expect(screen.getByText("Give up")).toBeDisabled();
});

test("keys do nothing while a modal is open; Enter submits after it closes", () => {
  render(<App />);
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

test("listeners are attached once, not on every render", () => {
  const add = jest.spyOn(window, "addEventListener");
  render(<App />);
  type("COT");
  expect(add.mock.calls.filter(([type]) => type === "keydown").length).toBe(1);
  add.mockRestore();
});
