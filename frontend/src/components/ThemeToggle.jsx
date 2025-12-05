import React from "react";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="pixel-button px-4 py-3 text-xs font-pixel bg-pixel-accent dark:bg-[#ff6f61b2] text-black dark:text-black"
    >
      {theme === "dark" ? "[LIGHT]" : "[DARK]"}
    </button>
  );
};

export default ThemeToggle;
