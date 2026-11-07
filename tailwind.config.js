module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // NYT Wordle light-mode palette.
        wordle: {
          correct: "#6aaa64",
          "correct-dark": "#538d4e",
          present: "#c9b458",
          absent: "#787c7e",
          empty: "#d3d6da", // empty tile border and unused keys
          filled: "#878a8c", // border of a typed, unchecked tile
        },
      },
    },
  },
  plugins: [],
};
