import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AppProvider } from '@/context/AppContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Nav } from '@/components/shell/Nav';
import { ThemeScript } from '@/components/ThemeScript';

export const metadata: Metadata = {
  title: 'Whatever — Personal Super App',
  description: 'Create and run mini-apps without code',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">
        <ThemeScript />
        <ThemeProvider>
          <LanguageProvider>
            <AppProvider>
              <Nav />
              <main className="container mx-auto px-4 py-6">{children}</main>
            </AppProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
