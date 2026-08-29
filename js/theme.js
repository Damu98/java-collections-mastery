/* ==========================================================================
   THEME
   --------------------------------------------------------------------------
   Light/dark theme, persisted in localStorage and defaulted from the OS
   preference. Applies the `dark` class to <html> (Tailwind's darkMode:
   'class' strategy) and flips which highlight.js stylesheet is active so
   code blocks always match the current theme.
   ========================================================================== */

const THEME_STORAGE_KEY = 'jcf-theme';

function getInitialTheme() {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyThemeToDocument(theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  const lightSheet = document.getElementById('hljs-light-theme');
  const darkSheet = document.getElementById('hljs-dark-theme');
  if (lightSheet) lightSheet.disabled = theme === 'dark';
  if (darkSheet) darkSheet.disabled = theme !== 'dark';
}

function useTheme() {
  const [theme, setTheme] = React.useState(getInitialTheme);

  React.useEffect(() => {
    applyThemeToDocument(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = React.useCallback(() => {
    setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  return [theme, toggleTheme];
}
