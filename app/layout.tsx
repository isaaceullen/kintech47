import type {Metadata} from 'next';
import { Toaster } from 'react-hot-toast';
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
      </body>
    </html>
  );
}
