export default {
  darkMode: 'class',
  content: [
    "./src/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",

        surface: "var(--color-surface)",
        "surface-2": "var(--color-surface-2)",

        border: "var(--color-border)",
        muted: "var(--color-muted)",

        primary: "var(--color-primary)",
        "on-primary": "var(--color-on-primary)",

        accent: "var(--color-accent)",
        "on-accent": "var(--color-on-accent)",

        danger: "var(--color-danger)",
        success: "var(--color-success)",
      }
    }
  }
}