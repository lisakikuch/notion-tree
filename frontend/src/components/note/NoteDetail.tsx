'use client';

import { useState, useEffect, useCallback } from 'react';
import { useInterestDetail, useUpdateInterest } from '@/hooks/useInterests';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteDetailProps {
  noteId: string;
  isEditing?: boolean;
  onEditingChange?: (editing: boolean) => void;
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

export function NoteDetail({ noteId, isEditing = false, onEditingChange }: NoteDetailProps) {
  const { data: note, isLoading, error } = useInterestDetail(noteId);
  const updateMutation = useUpdateInterest();

  const [localTitle, setLocalTitle] = useState('');
  const [localReflection, setLocalReflection] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with fetched data
  useEffect(() => {
    if (note) {
      setLocalTitle(note.title);
      setLocalReflection(note.reflection || '');
      setHasChanges(false);
    }
  }, [note]);

  // Track changes
  useEffect(() => {
    if (note) {
      const titleChanged = localTitle !== note.title;
      const reflectionChanged = localReflection !== (note.reflection || '');
      setHasChanges(titleChanged || reflectionChanged);
    }
  }, [localTitle, localReflection, note]);

  const handleSave = useCallback(() => {
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
  }, [noteId, localTitle, localReflection, hasChanges, updateMutation, onEditingChange]);

  const handleCancel = useCallback(() => {
    if (note) {
      setLocalTitle(note.title);
      setLocalReflection(note.reflection || '');
      setHasChanges(false);
    }
    onEditingChange?.(false);
  }, [note, onEditingChange]);

  const handleBlur = useCallback(() => {
    if (hasChanges && isEditing) {
      handleSave();
    }
  }, [hasChanges, isEditing, handleSave]);

  if (!noteId) {
    return <EmptyNoteState />;
  }

  if (isLoading) {
    return <NoteDetailSkeleton />;
  }

  if (error || !note) {
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

  return (
    <div className="flex flex-col h-full">
      {/* Header with title and edit toggle */}
      <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-border">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              type="text"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              onBlur={handleBlur}
              className={cn(
                'w-full text-2xl font-semibold bg-transparent border-b-2 border-primary',
                'outline-none focus:border-primary text-foreground',
                'placeholder:text-muted-foreground'
              )}
              placeholder="Note title..."
              autoFocus
            />
          ) : (
            <h1 className="text-2xl font-semibold text-foreground truncate">{note.title}</h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={updateMutation.isPending}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Cancel</span>
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={handleSave}
                disabled={!hasChanges || updateMutation.isPending}
                className="bg-primary hover:bg-primary/90"
              >
                <Check className="w-4 h-4" />
                <span className="sr-only">Save</span>
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEditingChange?.(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Pencil className="w-4 h-4" />
              <span className="sr-only">Edit</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 px-6 py-4 border-b border-border">
        {note.tags.length > 0 ? (
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
        {isEditing ? (
          <textarea
            value={localReflection}
            onChange={(e) => setLocalReflection(e.target.value)}
            onBlur={handleBlur}
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
            {note.reflection ? (
              <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                {note.reflection}
              </p>
            ) : (
              <p className="text-muted-foreground italic">No reflection yet. Click edit to add one.</p>
            )}
          </div>
        )}
      </div>

      {/* Saving indicator */}
      {updateMutation.isPending && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
