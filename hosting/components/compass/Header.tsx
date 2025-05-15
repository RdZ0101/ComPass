
"use client";

import { Compass } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserNav } from '@/components/auth/UserNav';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton'; // For loading state

export function Header() {
  const { user, isLoading } = useAuth();

  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <Compass className="h-8 w-8 text-primary mr-3" />
          <h1 className="text-3xl font-bold text-primary">ComPass</h1>
          <p className="ml-4 text-muted-foreground hidden sm:block">Your AI Travel Planner</p>
        </Link>
        
        <div className="flex items-center space-x-3">
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-20 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ) : user ? (
            <UserNav />
          ) : (
            <>
              <Button asChild variant="outline">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
