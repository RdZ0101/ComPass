
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Chrome } from "lucide-react"; // Using Chrome as a generic browser/Google icon

export function GoogleSignInButton() {
  const { signInWithGoogle, isLoading } = useAuth();

  return (
    <Button
      variant="outline"
      onClick={signInWithGoogle}
      disabled={isLoading}
      className="w-full"
    >
      <Chrome className="mr-2 h-5 w-5" />
      Sign in with Google
    </Button>
  );
}
