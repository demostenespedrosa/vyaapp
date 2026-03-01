
import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { ServiceWorkerRegistrar } from '@/components/vya/shared/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'VYA – Logística Colaborativa',
  description: 'Envie pacotes com quem já vai pelo caminho. Logística descentralizada e escalável.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'VYA',
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: 'VYA – Logística Colaborativa',
    description: 'Envie pacotes com quem já vai pelo caminho.',
    siteName: 'VYA',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F15A2B' },
    { media: '(prefers-color-scheme: dark)', color: '#F15A2B' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />

        {/* PWA – ícones e meta tags Apple */}
        <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/favicon-16x16.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-touch-fullscreen" content="yes" />

        {/* Splash screens inline mínimo — iOS usa apple-touch-icon automaticamente */}
        <meta name="msapplication-TileColor" content="#F15A2B" />
        <meta name="msapplication-TileImage" content="/icons/icon-512.png" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <ServiceWorkerRegistrar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
