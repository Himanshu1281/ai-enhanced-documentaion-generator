import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Documentation Generator',
  description: 'Generate clean, consistent documentation from code with AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-neutral-50 text-neutral-900 antialiased">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 p-4 sm:p-6 md:p-8">
          <header className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">AI Documentation Generator</h1>
            <a
              className="text-sm text-neutral-500 hover:text-neutral-700"
              href="https://nextjs.org"
              target="_blank"
              rel="noreferrer"
            >
              Built with Next.js
            </a>
          </header>
          <main className="flex-1">{children}</main>
          <footer className="pt-4 text-center text-xs text-neutral-500">
            © {new Date().getFullYear()} AI DocGen
          </footer>
        </div>
      </body>
    </html>
  );
}

