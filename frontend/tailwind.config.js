/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0B0F19",
        cardBg: "rgba(17, 24, 39, 0.7)",
        primaryIndigo: "#6366F1",
        accentCyan: "#06B6D4",
        borderSleek: "rgba(255, 255, 255, 0.08)",
        borderHover: "rgba(99, 102, 241, 0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "glow-mesh": "radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%)",
      },
      boxShadow: {
        "glass-inset": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.05)",
        "neon-glow": "0 0 15px -3px rgba(99, 102, 241, 0.5)",
      },
    },
  },
  plugins: [],
}
