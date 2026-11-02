import { DOCUMENT } from '@angular/common';
import { Injectable, computed, inject, signal } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'frontend-template.theme';
export const BRIGHTNESS_STORAGE_KEY = 'frontend-template.brightness';

/**
 * Persists surface brightness while retaining contrasting light/dark control profiles.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly level = signal(this.resolveInitialBrightness());

  readonly brightness = this.level.asReadonly();
  readonly isDark = computed(() => this.level() < 45);
  readonly currentTheme = computed<ThemeMode>(() => this.isDark() ? 'dark' : 'light');

  constructor() {
    this.apply();
  }

  setBrightness(value: number): void {
    if (!Number.isFinite(value)) {
      throw new RangeError('Brightness must be a finite number.');
    }
    this.level.set(Math.round(Math.min(100, Math.max(0, value))));
    this.apply();
    this.saveStoredMode(this.currentTheme());
    try {
      this.document.defaultView?.localStorage.setItem(BRIGHTNESS_STORAGE_KEY, String(this.level()));
    } catch (error) {
      console.warn('Could not save brightness preference', error);
    }
  }

  private resolveInitialBrightness(): number {
    try {
      const stored = this.document.defaultView?.localStorage.getItem(BRIGHTNESS_STORAGE_KEY);
      if (stored !== null && stored !== undefined && stored.trim() !== '') {
        const value = Number(stored);
        if (Number.isFinite(value) && value >= 0 && value <= 100) return Math.round(value);
        console.warn('Ignoring invalid stored brightness preference');
      }
    } catch (error) {
      console.warn('Could not read brightness preference', error);
    }
    return this.resolveInitialMode() === 'dark' ? 0 : 100;
  }

  private resolveInitialMode(): ThemeMode {
    const stored = this.readStoredMode();
    if (stored) {
      return stored;
    }
    const prefersDark = this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  private apply(): void {
    const root = this.document.documentElement;
    root.classList.toggle('dark-theme', this.isDark());
    root.setAttribute('data-brightness', String(this.level()));
  }

  private readStoredMode(): ThemeMode | null {
    try {
      const value = this.document.defaultView?.localStorage.getItem(THEME_STORAGE_KEY);
      return value === 'light' || value === 'dark' ? value : null;
    } catch {
      return null;
    }
  }

  private saveStoredMode(mode: ThemeMode): void {
    try {
      this.document.defaultView?.localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch {
      // Storage may be unavailable (e.g. privacy mode); the theme still applies for this session.
    }
  }
}
