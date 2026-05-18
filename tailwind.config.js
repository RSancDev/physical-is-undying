/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: "#080b12",
          panel: "#111827",
          panel2: "#172033",
          line: "#273247",
          text: "#f7f8fb",
          muted: "#9aa6bb",
          gold: "#f2c14e",
          cyan: "#36c5f0",
          red: "#f87171",
          green: "#5ee7a1"
        }
      },
      boxShadow: {
        glow: "0 18px 60px rgba(54, 197, 240, 0.16)"
      }
    }
  },
  plugins: []
};
