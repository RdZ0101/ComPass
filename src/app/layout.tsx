import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

const geistSans = GeistSans({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ComPass - AI Travel Planner',
  description: 'Generate personalized travel itineraries with ComPass, your AI-powered travel assistant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geistSans.variable}> {/* Apply font variable to html tag */}
      <body className="antialiased"> {/* Removed font class from body as it's on html */}
        {children}
      </body>
    </html>
  );
}
