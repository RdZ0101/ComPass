import { Compass } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center">
        <Compass className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-3xl font-bold text-primary">ComPass</h1>
        <p className="ml-4 text-muted-foreground">Your AI Travel Planner</p>
      </div>
    </header>
  );
}
