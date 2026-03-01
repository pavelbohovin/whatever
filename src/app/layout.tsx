import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { AppProvider } from '@/context/AppContext';
import { Nav } from '@/components/shell/Nav';

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
    <html lang="en">
      <body className="min-h-screen bg-whatever-surface">
        <LanguageProvider>
          <AppProvider>
            <Nav />
            <main className="container mx-auto px-4 py-6">{children}</main>
          </AppProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
