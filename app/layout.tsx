import type {Metadata} from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import MetaPixel from '@/components/MetaPixel';
import PopupModal from '@/components/PopupModal';
import WhatsAppButton from '@/components/WhatsAppButton';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Kintech47',
  description: 'Importados Joinville',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-br">
      <head>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '1573395106821956');
            fbq('track', 'PageView');
          `}
        </Script>
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1573395106821956&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </head>
      <body suppressHydrationWarning>
        {children}
        <WhatsAppButton />
        <PopupModal />
        <Toaster position="bottom-right" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-TWWY3KG6YK" strategy="afterInteractive" />
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
      </body>
    </html>
  );
}
