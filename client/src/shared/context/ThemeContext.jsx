import { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState("dark"); // 'light' | 'dark'

  // Load saved theme
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("budgetly-theme-config");
      if (savedTheme) {
        const parsed = JSON.parse(savedTheme);
        // Support both new string format and legacy object format
        const mode = typeof parsed === "string" ? parsed : parsed?.mode;
        if (mode === "light" || mode === "dark") setThemeMode(mode);
      } else {
        const oldTheme = localStorage.getItem("budgetly-theme");
        if (oldTheme === "light" || oldTheme === "dark") setThemeMode(oldTheme);
      }
    } catch (e) {
      console.error("Error parsing theme config", e);
    }
  }, []);

  // Persist and apply theme
  useEffect(() => {
    localStorage.setItem("budgetly-theme-config", JSON.stringify(themeMode));

    const root = document.documentElement;
    if (themeMode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    // Clean up any leftover palette classes from previous versions
    root.classList.remove("theme-dark-orange");

    // Clean up inline styles from previous version
    [
      "dark",
      "primary",
      "secondary",
      "light",
      "bg",
      "surface",
      "success",
      "error",
      "warning",
      "info",
      "border",
      "hover",
      "gradient-bg",
      "zigzag-color",
      "primary-bg",
      "primary-border",
    ].forEach((key) => {
      root.style.removeProperty(`--color-${key}`);
    });
    root.style.removeProperty("--gradient-bg");
    root.style.removeProperty("--zigzag-color");
    document.body.style.background = "";
  }, [themeMode]);

  const changeThemeMode = (mode) => {
    if (mode === "light" || mode === "dark") {
      setThemeMode(mode);
    }
  };

  const value = {
    themeMode,
    changeThemeMode,
    currentTheme: themeMode,
    changeTheme: changeThemeMode,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};
