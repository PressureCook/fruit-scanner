
import type {Metadata, Viewport} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'FreshScan - AI Food Scanner',
  description: 'Instantly check fruit and food quality using advanced AI.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FreshScan',
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2d9a42',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen overflow-x-hidden selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
