'use client';

import Script from 'next/script';

/** Runs before hydration to prevent theme flash */
const themeScript = `
(function() {
  const key = 'whatever_theme';
  const stored = localStorage.getItem(key);
  const dark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  if (dark) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
})();
`;

export function ThemeScript() {
  return (
    <Script
      id="theme-init"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: themeScript }}
    />
  );
}
