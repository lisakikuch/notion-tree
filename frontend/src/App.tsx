'use client';

import { useEffect, useRef, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/components/auth/LoginPage';
import { Sidebar, TEMP_NEW_NOTE_ID } from '@/components/layout/Sidebar';
import { NoteDetail } from '@/components/note/NoteDetail';
import { queryClient } from '@/lib/queryClient';
import { clearAccessToken, setAccessToken } from '@/lib/authToken';
import { authApiClient } from '@/lib/apiClient';
import { logout } from '@/api/auth';

function MainLayout() {
  const [selectedNoteId, setSelectedNoteId] = useState<string>();
  const [isEditing, setIsEditing] = useState(false);
  const [tempNewNoteTitle, setTempNewNoteTitle] = useState('');

  const isCreatingNew = selectedNoteId === TEMP_NEW_NOTE_ID;

  function handleSelectNote(id: string) {
    // If navigating away from unsaved new note, discard it
    if (isCreatingNew && id !== TEMP_NEW_NOTE_ID) {
      setTempNewNoteTitle('');
    }
    setSelectedNoteId(id);
    setIsEditing(false);
  }

  function handleAddNote() {
    setSelectedNoteId(TEMP_NEW_NOTE_ID);
    setTempNewNoteTitle('');
    setIsEditing(true);
  }

  function handleNoteCreated(id: string) {
    setSelectedNoteId(id);
    setTempNewNoteTitle('');
    setIsEditing(true); // Keep in edit mode after creation
  }

  function handleCancelNew() {
    setSelectedNoteId(undefined);
    setTempNewNoteTitle('');
    setIsEditing(false);
  }

  function handleNoteDeleted() {
    setSelectedNoteId(undefined);
    setIsEditing(false);
  }

  async function handleLogout() {
    await logout();
    window.location.reload();
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        selectedNoteId={selectedNoteId}
        onSelectNote={handleSelectNote}
        onAddNote={handleAddNote}
        onLogout={handleLogout}
        tempNewNoteTitle={isCreatingNew ? tempNewNoteTitle : undefined}
      />
      <main className="flex-1 relative">
        <NoteDetail
          noteId={selectedNoteId!}
          isEditing={isEditing}
          onEditingChange={setIsEditing}
          isNew={isCreatingNew}
          onCreated={handleNoteCreated}
          onCancelNew={handleCancelNew}
          onNewTitleChange={setTempNewNoteTitle}
          onDeleted={handleNoteDeleted}
        />
      </main>
    </div>
  );
}

function StartupAuthLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
    </div>
  );
}

export function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const didAttemptRefresh = useRef(false);

  useEffect(() => {
    if (didAttemptRefresh.current) return;
    didAttemptRefresh.current = true;

    async function refreshSession() {
      try {
        const { data } = await authApiClient.post<{ accessToken: string }>('/auth/refresh');
        setAccessToken(data.accessToken);
        setIsAuthenticated(true);
      } catch {
        clearAccessToken();
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    }

    void refreshSession();
  }, []);

  function handleLoginSuccess() {
    setIsAuthenticated(true);
  }

  if (isCheckingAuth) {
    return <StartupAuthLoader />;
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
