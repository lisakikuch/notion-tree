'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInterestDetail, useUpdateInterest, useCreateInterest, useDeleteInterest } from '@/hooks/useInterests';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { Check, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteDetailProps {
  noteId: string;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
  isNew?: boolean;
  onCreated?: (id: string) => void;
  onCancelNew?: () => void;
  onNewTitleChange?: (title: string) => void;
  onDeleted?: () => void;
}

function NoteDetailSkeleton() {
  return (
    <div className="flex flex-col h-full p-6 animate-pulse">
      {/* Title skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-2/3 bg-muted rounded-md" />
        <div className="h-9 w-9 bg-muted rounded-md" />
      </div>

      {/* Tags skeleton */}
      <div className="flex gap-2 mb-6">
        <div className="h-6 w-16 bg-muted rounded-full" />
        <div className="h-6 w-20 bg-muted rounded-full" />
        <div className="h-6 w-14 bg-muted rounded-full" />
      </div>

      {/* Reflection skeleton */}
      <div className="flex-1 space-y-3">
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-5/6 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-4/5 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </div>
    </div>
  );
}

function EmptyNoteState() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-6">
      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">No note selected</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Select a note from the sidebar to view and edit its contents
      </p>
    </div>
  );
}

export function NoteDetail({ 
  noteId, 
  isEditing = false, 
  onEditingChange,
  isNew = false,
  onCreated,
  onCancelNew,
  onNewTitleChange,
  onDeleted,
}: NoteDetailProps) {
  const { data: note, isLoading, error } = useInterestDetail(isNew ? undefined : noteId);
  const updateMutation = useUpdateInterest();
  const createMutation = useCreateInterest();
  const deleteMutation = useDeleteInterest();

  const [localTitle, setLocalTitle] = useState('');
  const [localReflection, setLocalReflection] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Reset state when switching to new note mode
  useEffect(() => {
    if (isNew) {
      setLocalTitle('');
      setLocalReflection('');
      setHasChanges(false);
      setCreateError(null);
    }
  }, [isNew]);

  // Sync local state with fetched data
  useEffect(() => {
    if (note && !isNew) {
      setLocalTitle(note.title);
      setLocalReflection(note.reflection || '');
      setHasChanges(false);
    }
  }, [note, isNew]);

  // Track changes
  useEffect(() => {
    if (isNew) {
      setHasChanges(localTitle.trim().length > 0 || localReflection.trim().length > 0);
    } else if (note) {
      const titleChanged = localTitle !== note.title;
      const reflectionChanged = localReflection !== (note.reflection || '');
      setHasChanges(titleChanged || reflectionChanged);
    }
  }, [localTitle, localReflection, note, isNew]);

  // Notify parent of title changes for sidebar display
  useEffect(() => {
    if (isNew) {
      onNewTitleChange?.(localTitle);
    }
  }, [localTitle, isNew, onNewTitleChange]);

  const handleSave = useCallback(() => {
    if (isNew) {
      // Create new note
      const trimmedTitle = localTitle.trim();
      if (!trimmedTitle) return;

      setCreateError(null);
      createMutation.mutate(
        {
          title: trimmedTitle,
          reflection: localReflection.trim() || undefined,
          tagIds: [],
        },
        {
          onSuccess: (data) => {
            setHasChanges(false);
            onCreated?.(data.id);
          },
          onError: (err) => {
            setCreateError(err instanceof Error ? err.message : 'Failed to create note');
          },
        }
      );
    } else {
      // Update existing note
      if (!noteId || !hasChanges) return;

      updateMutation.mutate(
        {
          id: noteId,
          payload: {
            title: localTitle,
            reflection: localReflection,
          },
        },
        {
          onSuccess: () => {
            setHasChanges(false);
            onEditingChange?.(false);
          },
        }
      );
    }
  }, [isNew, noteId, localTitle, localReflection, hasChanges, createMutation, updateMutation, onEditingChange, onCreated]);

  const handleCancel = useCallback(() => {
    if (isNew) {
      onCancelNew?.();
    } else if (note) {
      setLocalTitle(note.title);
      setLocalReflection(note.reflection || '');
      setHasChanges(false);
      onEditingChange?.(false);
    }
  }, [isNew, note, onEditingChange, onCancelNew]);

  const handleDelete = useCallback(() => {
    if (!noteId || isNew) return;

    deleteMutation.mutate(noteId, {
      onSuccess: () => {
        onDeleted?.();
      },
    });
  }, [noteId, isNew, deleteMutation, onDeleted]);

  if (!noteId && !isNew) {
    return <EmptyNoteState />;
  }

  if (isLoading && !isNew) {
    return <NoteDetailSkeleton />;
  }

  if ((error || !note) && !isNew) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-6">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <X className="w-8 h-8 text-destructive" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">Failed to load note</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          {error?.message || 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  const showEditMode = isNew || isEditing;
  const isSaving = isNew ? createMutation.isPending : updateMutation.isPending;
  const canSave = isNew 
    ? localTitle.trim().length > 0 
    : hasChanges;

  const currentTagIds = note?.tags.map((t) => t.id) ?? [];

  return (
    <div className="flex flex-col h-full">
      {/* TopBar for existing notes (not in new mode) */}
      {!isNew && noteId && (
        <TopBar
          noteId={noteId}
          currentTagIds={currentTagIds}
          isEditing={isEditing}
          onToggleEdit={() => {
            if (isEditing && hasChanges) {
              handleSave();
            } else {
              onEditingChange?.(!isEditing);
            }
          }}
          onDeleteNote={handleDelete}
        />
      )}

      {/* Error banner for create mode */}
      {createError && (
        <div className="flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive border-b border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{createError}</p>
        </div>
      )}

      {/* Header with title */}
      <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border">
        <div className="flex-1 min-w-0">
          {showEditMode ? (
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              className={cn(
                'w-full text-2xl font-semibold bg-transparent border-b-2 border-primary',
                'outline-none focus:border-primary text-foreground',
                'placeholder:text-muted-foreground'
              )}
              placeholder="Note title..."
              autoFocus
            />
          ) : (
            <h1 className="text-2xl font-semibold text-foreground truncate">{note?.title}</h1>
          )}
        </div>

        {/* Save/Cancel buttons only shown in new note mode */}
        {isNew && (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              disabled={isSaving}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
              <span className="sr-only">Cancel</span>
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-border">
        {isNew ? (
          <span className="text-sm text-muted-foreground italic">No tags</span>
        ) : note && note.tags.length > 0 ? (
          note.tags.map((tag) => (
            <span
              key={tag.id}
              className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-medium',
                'bg-secondary text-secondary-foreground'
              )}
            >
              {tag.name}
            </span>
          ))
        ) : (
          <span className="text-sm text-muted-foreground italic">No tags</span>
        )}
      </div>

      {/* Reflection content - takes most vertical space */}
      <div className="flex-1 p-6 overflow-auto">
        {showEditMode ? (
          <textarea
            value={localReflection}
            onChange={(e) => setLocalReflection(e.target.value)}
            className={cn(
              'w-full h-full min-h-[200px] resize-none',
              'bg-transparent text-foreground leading-relaxed',
              'outline-none focus:ring-0 border-none',
              'placeholder:text-muted-foreground'
            )}
            placeholder="Write your reflection here..."
          />
        ) : (
          <div className="prose prose-sm max-w-none">
            {note?.reflection ? (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {note.reflection}
              </p>
            ) : (
              <p className="text-muted-foreground italic">No reflection yet. Click edit to add one.</p>
            )}
          </div>
        )}
      </div>

      {/* Saving indicator for update mode */}
      {updateMutation.isPending && !isNew && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
