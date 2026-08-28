// src/context/LocaleContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { en } from "../locales/en";
import { hi } from "../locales/hi";

export type Locale = "en" | "hi";
export type FontSizeLevel = "sm" | "base" | "lg";

type LocaleStrings = typeof en;

interface LocaleContextProps {
  locale: Locale;
  strings: LocaleStrings;
  setLocale: (loc: Locale) => void;
  fontSizeLevel: FontSizeLevel;
  setFontSizeLevel: (level: FontSizeLevel) => void;
}

const LocaleContext = createContext<LocaleContextProps | undefined>(undefined);

export const LocaleProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [fontSizeLevel, setFontSizeLevelState] = useState<FontSizeLevel>("base");

  const strings = locale === "en" ? en : hi;

  useEffect(() => {
    const storedLocale = localStorage.getItem("locale") as Locale | null;
    if (storedLocale) setLocaleState(storedLocale);

    const storedFontSize = localStorage.getItem("fontSizeLevel") as FontSizeLevel | null;
    if (storedFontSize) setFontSizeLevelState(storedFontSize);
  }, []);

  useEffect(() => {
    let scalePercent = 105; // default base size is slightly larger as requested
    if (fontSizeLevel === "sm") scalePercent = 92;
    if (fontSizeLevel === "lg") scalePercent = 120;

    document.documentElement.style.fontSize = `${scalePercent}%`;
  }, [fontSizeLevel]);

  const setLocale = (loc: Locale) => {
    setLocaleState(loc);
    localStorage.setItem("locale", loc);
  };

  const setFontSizeLevel = (level: FontSizeLevel) => {
    setFontSizeLevelState(level);
    localStorage.setItem("fontSizeLevel", level);
  };

  return (
    <LocaleContext.Provider
      value={{
        locale,
        strings,
        setLocale,
        fontSizeLevel,
        setFontSizeLevel,
      }}
    >
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
};
