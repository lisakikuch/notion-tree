'use client';

import { useState } from 'react';
import { LoginPage } from '@/components/auth/LoginPage';

// Placeholder for main layout - will be replaced with actual layout
function MainLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Welcome to Notion Tree</h1>
        <p className="text-muted-foreground">You are now logged in.</p>
      </div>
    </div>
  );
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  function handleLoginSuccess() {
    setIsAuthenticated(true);
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <MainLayout />;
}
