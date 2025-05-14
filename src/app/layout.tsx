import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';

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
    <html lang="en" className={GeistSans.variable}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
