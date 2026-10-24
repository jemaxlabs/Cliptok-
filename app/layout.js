import './globals.css';

export const metadata = {
  title: 'ClipTok - Trends Start Here',
  description: 'ClipTok is the short video platform where creativity thrives. Watch, create, like, and share trending short videos.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  themeColor: '#010101',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'ClipTok',
  },
};

export const viewport = {
  themeColor: '#010101',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark bg-[#010101]">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#010101] text-white min-h-screen overflow-hidden antialiased select-none font-sans">
        {children}
      </body>
    </html>
  );
    }
