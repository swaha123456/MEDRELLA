import type { Config } from "tailwindcss";
export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: { extend: { colors: { brand: { DEFAULT: "#0369a1", dark: "#082f49", light: "#e0f2fe" } } } },
} satisfies Config;
