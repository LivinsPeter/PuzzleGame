export const DEFAULT_THEME = { bg: '#170b25', wall: '#ffd166', ball: '#d8c4ff', target: '#ff7a18', path: '#7ed957' };

export function readTheme() {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(Object.entries(DEFAULT_THEME).map(([key, fallback]) => [key, styles.getPropertyValue(`--${key}`).trim() || fallback]));
}
