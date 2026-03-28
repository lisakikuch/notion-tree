'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/components/auth/LoginPage';
import { Sidebar } from '@/components/layout/Sidebar';
import { queryClient } from '@/lib/queryClient';
import { clearAccessToken } from '@/lib/authToken';

function MainLayout() {
  const [selectedNoteId, setSelectedNoteId] = useState<string>();

  function handleSelectNote(id: string) {
    setSelectedNoteId(id);
  }

  function handleAddNote() {
    // TODO: Implement add note functionality
    console.log('Add new note');
  }

  function handleLogout() {
    clearAccessToken();
    window.location.reload();
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onAddNote={handleAddNote}
        onLogout={handleLogout}
      />
      <main className="flex-1 flex items-center justify-center">
        {selectedNoteId ? (
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground">Note Selected</p>
            <p className="text-sm text-muted-foreground">ID: {selectedNoteId}</p>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-foreground">Welcome to Notion Tree</p>
            <p className="text-sm text-muted-foreground">Select a note or create a new one</p>
          </div>
        )}
      </main>
    </div>
  );
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  function handleLoginSuccess() {
    setIsAuthenticated(true);
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <MainLayout />
    </QueryClientProvider>
  );
}
