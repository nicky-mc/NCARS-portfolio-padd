import type {Metadata} from 'next';
import './globals.css'; // Global styles
import NCARSLayout from '@/components/NCARSLayout';

export const metadata: Metadata = {
  title: 'NCARS 25 Portfolio',
  description: 'Picard-era LCARS 25 / NCARS Portfolio',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <NCARSLayout>
          {children}
        </NCARSLayout>
      </body>
    </html>
  );
}
