import { TestBed } from '@angular/core/testing';
import { BRIGHTNESS_STORAGE_KEY, THEME_STORAGE_KEY, ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark-theme');
  });

  it('restores a saved preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    const service = TestBed.inject(ThemeService);
    expect(service.isDark()).toBe(true);
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
  });

  it('persists changes and updates the document class', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'light');
    const service = TestBed.inject(ThemeService);
    service.setBrightness(0);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(true);
    service.setBrightness(100);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
    expect(document.documentElement.classList.contains('dark-theme')).toBe(false);
  });

  it('restores a saved intermediate brightness ahead of the legacy theme', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    localStorage.setItem(BRIGHTNESS_STORAGE_KEY, '68');
    const service = TestBed.inject(ThemeService);
    expect(service.brightness()).toBe(68);
    expect(service.currentTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-brightness')).toBe('68');
  });

  it('persists brightness and updates the document attribute', () => {
    const service = TestBed.inject(ThemeService);
    service.setBrightness(25);
    expect(service.brightness()).toBe(25);
    expect(service.isDark()).toBe(true);
    expect(localStorage.getItem(BRIGHTNESS_STORAGE_KEY)).toBe('25');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.getAttribute('data-brightness')).toBe('25');
  });

  it('clamps and rounds finite input and rejects nonfinite input', () => {
    const service = TestBed.inject(ThemeService);
    service.setBrightness(12.6);
    expect(service.brightness()).toBe(13);
    service.setBrightness(-1);
    expect(service.brightness()).toBe(0);
    service.setBrightness(101);
    expect(service.brightness()).toBe(100);
    expect(() => service.setBrightness(Number.NaN)).toThrow(RangeError);
    expect(() => service.setBrightness(Infinity)).toThrow(RangeError);
    expect(service.brightness()).toBe(100);
  });

  it('falls back to the legacy preference when saved brightness is invalid', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    localStorage.setItem(BRIGHTNESS_STORAGE_KEY, 'invalid');
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(TestBed.inject(ThemeService).brightness()).toBe(0);
    expect(warning).toHaveBeenCalled();
    warning.mockRestore();
  });

  it('applies brightness even if persistence is unavailable and reports the failure', () => {
    const service = TestBed.inject(ThemeService);
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const storage = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    try {
      service.setBrightness(50);
      expect(service.brightness()).toBe(50);
      expect(document.documentElement.getAttribute('data-brightness')).toBe('50');
      expect(warning).toHaveBeenCalledWith('Could not save brightness preference', expect.any(Error));
    } finally {
      storage.mockRestore();
      warning.mockRestore();
    }
  });
});
