// Light/dark theme. Tailwind's `dark:` classes and the CSS variables in
// index.css key off a `dark` class on <html>. public/index.html sets that class
// before React loads (stored choice, else the system setting) to avoid a flash.
export type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

export const getTheme = (): Theme =>
  document.documentElement.classList.contains("dark") ? "dark" : "light";

export const setTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (err) {
    // Storage can be unavailable (e.g. private mode); the toggle still works
    // for this visit.
    console.warn("Could not save theme preference", err);
  }
};
