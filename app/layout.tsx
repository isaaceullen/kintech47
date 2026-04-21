import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { Suspense } from 'react';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import MetaPixel from '@/components/MetaPixel';
import WhatsAppButton from '@/components/WhatsAppButton';
import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// 1. Metadados para o Next.js (Mantenha para SEO interno)
export const metadata: Metadata = {
  title: 'Kintech47 | Importados em Joinville',
  description: 'Melhores produtos importados em Joinville. Qualidade garantida e preço justo.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-br" className={cn("font-sans", geist.variable)}>
      <head>
        {/* 2. TAG DE VERIFICAÇÃO MANUAL (O PULO DO GATO) */}
        <meta name="google-site-verification" content="google2cbc8075d15b194f" />
        
        {/* Meta Pixel Script */}
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
      </head>
      <body suppressHydrationWarning>
        {children}
        <WhatsAppButton />
        <Toaster position="bottom-right" />
        
        {/* Google Analytics Script */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-TWWY3KG6YK" strategy="afterInteractive" />
        
        <Suspense fallback={null}>
          <GoogleAnalytics />
        </Suspense>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        
        <noscript>
          <img height="1" width="1" style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=1573395106821956&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}