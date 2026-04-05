/**
 * Inline IIFE for `next/script` (beforeInteractive). Keeps first paint in sync with
 * `ThemeProvider` (storage key, class names, system preference).
 * Must stay in sync with `theme-provider.tsx`.
 */
export const THEME_STORAGE_KEY = "theme";

export const THEME_INIT_SCRIPT = `
(function(){
  try {
    var d = document.documentElement;
    var cl = d.classList;
    cl.remove("light","dark");
    var t = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (t === "dark") { cl.add("dark"); d.style.colorScheme = "dark"; return; }
    if (t === "light") { cl.add("light"); d.style.colorScheme = "light"; return; }
    var mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq.matches) { cl.add("dark"); d.style.colorScheme = "dark"; }
    else { cl.add("light"); d.style.colorScheme = "light"; }
  } catch (e) {}
})();
`.trim();
