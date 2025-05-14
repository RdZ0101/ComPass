import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

// const geistSans = GeistSans({ // This was incorrect
//   variable: '--font-geist-sans',
//   subsets: ['latin'],
// });

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
    <html lang="en" className={GeistSans.variable}> {/* Use GeistSans.variable directly */}
      <body className="antialiased"> {/* Removed font class from body as it's on html */}
        {children}
      </body>
    </html>
  );
}
