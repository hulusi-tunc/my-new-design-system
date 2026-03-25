"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { colors } from "@/styles/design-tokens";
import {
  type BrandPalette,
  generateBrandPalette,
  isValidHex,
  DEFAULT_BRAND_HEX,
} from "@/styles/color-utils";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
  brandPalette: BrandPalette;
  brandHex: string;
  setBrandHex: (hex: string) => void;
  resetBrand: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  toggle: () => {},
  brandPalette: colors.brand as unknown as BrandPalette,
  brandHex: DEFAULT_BRAND_HEX,
  setBrandHex: () => {},
  resetBrand: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

/** Forces all children to render as dark mode, regardless of global theme */
export function DarkModeOverride({ children }: { children: React.ReactNode }) {
  const parent = useContext(ThemeContext);
  const value = useMemo(
    () => ({ ...parent, theme: "dark" as const }),
    [parent]
  );
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [brandHex, setBrandHexState] = useState(DEFAULT_BRAND_HEX);
  const [mounted, setMounted] = useState(false);

  const brandPalette = useMemo<BrandPalette>(() => {
    if (brandHex === DEFAULT_BRAND_HEX) return colors.brand as unknown as BrandPalette;
    return generateBrandPalette(brandHex);
  }, [brandHex]);

  // Initialize from localStorage
  useEffect(() => {
    const storedTheme = localStorage.getItem("octopus-theme") as Theme | null;
    const initialTheme = storedTheme ?? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initialTheme);

    const storedBrand = localStorage.getItem("octopus-brand-hex");
    if (storedBrand && isValidHex(storedBrand)) {
      setBrandHexState(storedBrand.startsWith("#") ? storedBrand : `#${storedBrand}`);
    }

    setMounted(true);
  }, []);

  // Sync theme to DOM
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem("octopus-theme", theme);
  }, [theme, mounted]);

  // Sync brand selection colors to CSS custom properties
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    root.style.setProperty("--brand-selection-bg", brandPalette[100]);
    root.style.setProperty("--brand-selection-bg-dark", brandPalette[900]);
  }, [brandPalette, mounted]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  const setBrandHex = (hex: string) => {
    const normalized = hex.startsWith("#") ? hex : `#${hex}`;
    if (!isValidHex(normalized)) return;
    setBrandHexState(normalized.toUpperCase());
    localStorage.setItem("octopus-brand-hex", normalized.toUpperCase());
  };

  const resetBrand = () => {
    setBrandHexState(DEFAULT_BRAND_HEX);
    localStorage.removeItem("octopus-brand-hex");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, brandPalette, brandHex, setBrandHex, resetBrand }}>
      {children}
    </ThemeContext.Provider>
  );
}
