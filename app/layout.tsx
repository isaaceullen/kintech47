import type {Metadata} from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Kintech47',
  description: 'Importados Joinville',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-br">
      <body suppressHydrationWarning>
        {children}
        <Toaster position="bottom-right" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-TWWY3KG6YK" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-TWWY3KG6YK');
          `}
        </Script>
      </body>
    </html>
  );
}
