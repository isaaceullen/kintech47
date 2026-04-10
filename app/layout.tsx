import type {Metadata} from 'next';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import GoogleAnalytics from '@/components/GoogleAnalytics';
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
      <body suppressHydrationWarning>
        {children}
        <WhatsAppButton />
        <PopupModal />
        <Toaster position="bottom-right" />
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-TWWY3KG6YK" strategy="afterInteractive" />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
