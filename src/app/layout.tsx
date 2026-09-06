import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'IELTS Pattern Bank',
  description: 'Quick reference for IELTS Writing Task 1 data-reporting sentence patterns',
};

// Runs while the HTML is still parsing, before anything is painted, so the saved
// theme is in place from the very first frame. `window.api` is already available
// because the Electron preload script has run by this point.
const THEME_BOOTSTRAP = `(function(){try{var t=window.api&&window.api.initialTheme;if(t&&t!=='system'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
        {children}
      </body>
    </html>
  );
}
