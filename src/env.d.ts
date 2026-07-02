interface Window {
  theme?: {
    themeValue: string;
    setPreference: () => void;
    reflectPreference: () => void;
    getTheme: () => string;
    setTheme: (val: string) => void;
  };
  __theme?: { value: string };
  __closeLightbox?: (() => void) | null;
  __lightboxSwapBound?: boolean;
}
