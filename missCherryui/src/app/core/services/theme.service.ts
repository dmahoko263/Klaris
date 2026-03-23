import { isPlatformBrowser } from "@angular/common";
import { Injectable, signal,PLATFORM_ID, inject } from "@angular/core";

const LS_THEME_KEY = "cherry_theme"; // "dark" | "light"

@Injectable({ providedIn: "root" })
export class ThemeService {
  private platformId=inject(PLATFORM_ID);
  // true = dark, false = light
  isDark = signal<boolean>(false);

  init(): void {
     if (isPlatformBrowser(this.platformId)){
    const saved = localStorage.getItem(LS_THEME_KEY);

    if (saved === "dark") this.setDark(true);
    else if (saved === "light") this.setDark(false);
    else {
      // first time: follow system
      const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
      this.setDark(prefersDark);
    }}
  }

  toggle(): void {
    this.setDark(!this.isDark());
  }

  setDark(value: boolean): void {
    const storage=this.getSafeLocalStorage();
    this.isDark.set(value);

    const root = document.documentElement; // <html>
    if (value) root.classList.add("dark");
    else root.classList.remove("dark");

    storage?.setItem(LS_THEME_KEY, value ? "dark" : "light");
  }
  

  private getSafeLocalStorage(): Storage | null {
  if (isPlatformBrowser(this.platformId)) {
    return localStorage;
  }
  return null;
}
}