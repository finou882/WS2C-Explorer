import { useEffect, useState } from "react";
import { useSystemDarkMode } from "@/hooks/useSystemDarkMode";

export function useThemeMode() {
  // localStorage優先、なければシステム
  const systemDark = useSystemDarkMode();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return systemDark;
  });

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (!saved) setDark(systemDark);
  }, [systemDark]);

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return [dark, setDark] as const;
}
