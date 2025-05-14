
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext'; // Import AuthProvider
import { Toaster } from "@/components/ui/toaster"; // Ensure Toaster is available globally

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
        <AuthProvider> {/* Wrap children with AuthProvider */}
          {children}
          <Toaster /> {/* Toaster for auth notifications */}
        </AuthProvider>
      </body>
    </html>
  );
}
