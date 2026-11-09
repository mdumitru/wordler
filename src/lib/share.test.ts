import { getShareText, shareText } from "./share";

test("a win shows the guess count without the guess limit", () => {
  expect(getShareText(["COT", "CAT"], "CAT", true)).toBe(
    "Wordler 2 · 6 letters\n\n🟩⬜🟩\n🟩🟩🟩",
  );
});

test("a loss shows X", () => {
  expect(getShareText(["DOG"], "CAT", false)).toBe(
    "Wordler X · 3 letters\n\n⬜⬜⬜",
  );
});

test("high contrast uses orange and blue squares", () => {
  expect(getShareText(["COT", "CAT"], "CAT", true, true)).toBe(
    "Wordler 2 · 6 letters\n\n🟧⬜🟧\n🟧🟧🟧",
  );
});

test("a single letter is singular", () => {
  expect(getShareText(["A"], "CAT", false).split("\n")[0]).toBe(
    "Wordler X · 1 letter",
  );
});

describe("shareText", () => {
  const originalSecure = window.isSecureContext;
  afterEach(() => {
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value: originalSecure,
    });
    delete (navigator as any).share;
    delete (navigator as any).clipboard;
    delete (document as any).execCommand;
  });

  const setSecure = (value: boolean) =>
    Object.defineProperty(window, "isSecureContext", {
      configurable: true,
      value,
    });

  test("uses the native share sheet when there is one", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    (navigator as any).share = share;
    await expect(shareText("hi")).resolves.toBe("shared");
    expect(share).toHaveBeenCalledWith({ text: "hi" });
  });

  test("uses the clipboard API in a secure context", async () => {
    setSecure(true);
    const writeText = vi.fn().mockResolvedValue(undefined);
    (navigator as any).clipboard = { writeText };
    await expect(shareText("hi")).resolves.toBe("copied");
    expect(writeText).toHaveBeenCalledWith("hi");
  });

  test("falls back to execCommand over plain HTTP", async () => {
    setSecure(false);
    const execCommand = vi.fn().mockReturnValue(true);
    (document as any).execCommand = execCommand;
    await expect(shareText("hi")).resolves.toBe("copied");
    expect(execCommand).toHaveBeenCalledWith("copy");
    expect(document.querySelector("textarea")).toBeNull();
  });
});
