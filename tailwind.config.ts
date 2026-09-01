import type { Config } from "tailwindcss";

export default {
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        border: "rgb(var(--border))",
      },
    },
  },
} satisfies Config;