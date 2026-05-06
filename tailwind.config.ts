import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        naval: '#1B2E5E',
        blanco: '#FFFFFF',
        dorado: '#C8A728',
        azul: '#2D5CA6',
        oscuro: '#0F1E3D',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'rayas': 'repeating-linear-gradient(180deg, #1B2E5E 0px, #1B2E5E 4px, #FFFFFF 4px, #FFFFFF 8px)',
      },
    },
  },
  plugins: [],
};
export default config;
