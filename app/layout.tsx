import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { ToastProvider } from '@/components/providers/ToastProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { PermissionProvider } from '@/lib/contexts/permission-context';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Kiosk Backoffice',
  description: 'Admin panel for Kiosk system',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <ErrorBoundary>
          <QueryProvider>
            <PermissionProvider>
              {children}
              <ToastProvider />
              <LoadingOverlay />
            </PermissionProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
