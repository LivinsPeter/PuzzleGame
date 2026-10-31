export const DEFAULT_THEME = Object.freeze({
  bg: '#f3f6fb',
  wall: '#263247',
  ball: '#ef5b5b',
  target: '#35a879',
  path: '#9aa8bc'
});

export function readTheme() {
  const styles = getComputedStyle(document.documentElement);
  return Object.fromEntries(
    Object.keys(DEFAULT_THEME).map((key) => {
      const value = styles.getPropertyValue(`--${key}`).trim();
      return [key, value || DEFAULT_THEME[key]];
    })
  );
}
