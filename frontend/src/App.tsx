'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/components/auth/LoginPage';
import { Sidebar } from '@/components/layout/Sidebar';
import { NoteDetail } from '@/components/note/NoteDetail';
import { queryClient } from '@/lib/queryClient';
import { clearAccessToken } from '@/lib/authToken';

function MainLayout() {
  const [selectedNoteId, setSelectedNoteId] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);

  function handleSelectNote(id: string) {
    setSelectedNoteId(id);
    setIsEditing(false);
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
      <main className="flex-1 relative">
        <NoteDetail
          noteId={selectedNoteId!}
          isEditing={isEditing}
          onEditingChange={setIsEditing}
        />
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
