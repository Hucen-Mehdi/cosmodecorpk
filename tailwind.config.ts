import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./src/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#1A4D3E',  // Forest Pine
                    dark: '#0F3A2F',
                    light: '#A8C3B2',
                },
                secondary: '#5F7F6C',   // Sage Green
                background: '#F9F7F3',   // Ivory Linen
                surface: '#FFFFFF',      // White Smoke
                text: {
                    primary: '#2C2C2C',    // Charcoal
                    secondary: '#6B6B6B',  // Stone Gray
                },
                border: '#E5E0D8',       // Mist Gray
                error: '#C25A4A',        // Terracotta (errors only)
                star: '#F5B042',         // Gold
            }
        },
    },
    plugins: [],
};

export default config;
