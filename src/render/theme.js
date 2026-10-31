export const DEFAULT_THEME = { bg: '#f4f7fb', wall: '#1c2b42', ball: '#3a74d9', target: '#df5a45', path: '#5c9f74' };

export function readTheme() {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(Object.entries(DEFAULT_THEME).map(([key, fallback]) => [key, styles.getPropertyValue(`--${key}`).trim() || fallback]));
}
