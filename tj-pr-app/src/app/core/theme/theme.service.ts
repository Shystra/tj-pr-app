import { Injectable } from '@angular/core';

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light'
}

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly localStorageKey = 'theme';
  private currentTheme: Theme;

  constructor() {
    this.currentTheme = this.getStoredTheme();
    this.applyTheme(this.currentTheme);
  }

  toggleTheme(): void {
    this.currentTheme =
      this.currentTheme === Theme.DARK ? Theme.LIGHT : Theme.DARK;

    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme: Theme): void {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.localStorageKey, theme);
  }

  getStoredTheme(): Theme {
    const theme = localStorage.getItem(this.localStorageKey);

    if (!theme)
      return Theme.DARK;

    return theme === Theme.DARK ? Theme.DARK : Theme.LIGHT;
  }
}
