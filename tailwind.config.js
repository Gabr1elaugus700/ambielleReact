/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "#3b82f6",
          600: "#2563eb",
        },
        background: { light: "hsl(220, 20%, 97%)", dark: "#1a202c" },
        status: {
          iniciado: "#fef08a",
          coleta: "#93c5fd",
          execucao: "#86efac",
          aprovacao: "#fdbb74",
          protocolado: "#fca5a5",
          "iniciado-border": "#facc15",
          "coleta-border": "#60a5fa",
          "execucao-border": "#4ade80",
          "aprovacao-border": "#fb923c",
          "protocolado-border": "#f87171",
        },
        cardColor: {
          laranja: "hsl(25, 95%, 53%)",
          verde: "hsl(142, 76%, 36%)",
          azul: "hsl(217, 91%, 60%)",
          amarelo: "hsl(45, 93%, 47%)",
          roxo: "hsl(271, 81%, 56%)",
          vermelho: "hsl(0, 84%, 60%)",
        },
        modal: { 
          light: "#ffffff", 
          dark: "#2d3748" 
        },
        form: {
          label: "#4a5568"
        },
      },
      borderRadius: { DEFAULT: "0.5rem" },
      boxShadow: { card: "0 4px 12px 0 rgba(0,0,0,0.08)" },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
