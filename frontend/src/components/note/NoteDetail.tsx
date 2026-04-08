'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Loader2, AlertCircle, FileText, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/apiClient';
import { useInterestDetail, useUpdateInterest, useCreateInterest, useDeleteInterest } from '@/hooks/useInterests';
import { TopBar } from '@/components/layout/TopBar';

// ---------------------------------------------------------------------------
// TagOverlay
// ---------------------------------------------------------------------------

interface TagOverlayProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

function TagOverlay({ selectedTagIds, onChange }: TagOverlayProps) {
  const { data: tagsData, isLoading } = useTags();
  const createTagMutation = useCreateTag();
  const deleteTagMutation = useDeleteTag();

  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const tags = tagsData?.data ?? [];

  function toggle(tagId: string) {
    const exists = selectedTagIds.includes(tagId);
    onChange(exists ? selectedTagIds.filter(id => id !== tagId) : [...selectedTagIds, tagId]);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newTagName.trim();
    if (!name) return;

    setError(null);
    createTagMutation.mutate(
      { name },
      {
        onSuccess: () => setNewTagName(''),
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) {
            setError('Tag already exists');
          } else {
            setError('Failed to create tag');
          }
        },
      }
    );
  }

  return (
    <div className="w-72 border rounded-md p-3 bg-card">
      <div className="max-h-48 overflow-y-auto mb-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          tags.map(tag => {
            const checked = selectedTagIds.includes(tag.id);
            return (
              <label key={tag.id} className="flex items-center gap-2 text-sm py-1">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(tag.id)}
                />
                <span className="flex-1">{tag.name}</span>
                <button
                  type="button"
                  onClick={() => deleteTagMutation.mutate(tag.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </label>
            );
          })
        )}
      </div>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={newTagName}
          onChange={(e) => {
            setNewTagName(e.target.value);
            setError(null);
          }}
          placeholder="New tag"
          className="flex-1 px-2 py-1 border rounded text-sm"
        />
        <Button size="sm" type="submit">
          {createTagMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
        </Button>
      </form>

      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton / empty states
// ---------------------------------------------------------------------------

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
      <div className="flex items-center justify-between mb-4">
        <div className="h-8 w-2/3 bg-muted rounded-md" />
        <div className="h-9 w-9 bg-muted rounded-md" />
      </div>
      <div className="flex gap-2 mb-6">
        <div className="h-6 w-16 bg-muted rounded-full" />
        <div className="h-6 w-20 bg-muted rounded-full" />
        <div className="h-6 w-14 bg-muted rounded-full" />
      </div>
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

// ---------------------------------------------------------------------------
// NoteDetail
// ---------------------------------------------------------------------------

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

  // Used to look up tag names by id in both new and edit modes
  const { data: tagsData, isLoading: tagsLoading } = useTags();
  const allTags = tagsData?.data ?? [];

  const [localTitle, setLocalTitle] = useState('');
  const [localReflection, setLocalReflection] = useState('');
  const [localTagIds, setLocalTagIds] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  // Tag overlay is closed by default in both create and edit modes
  const [tagOverlayOpen, setTagOverlayOpen] = useState(false);

  // Reset state when switching to new-note mode
  useEffect(() => {
    if (isNew) {
      setLocalTitle('');
      setLocalReflection('');
      setLocalTagIds([]);
      setHasChanges(false);
      setCreateError(null);
      setTagOverlayOpen(false);
    }
  }, [isNew]);

  // Close the overlay whenever we leave edit mode
  useEffect(() => {
    if (!isEditing && !isNew) {
      setTagOverlayOpen(false);
    }
  }, [isEditing, isNew]);

  // Sync local state with fetched data
  useEffect(() => {
    if (note && !isNew) {
      setLocalTitle(note.title);
      setLocalReflection(note.reflection || '');
      setLocalTagIds(note.tags.map(t => t.id));
      setHasChanges(false);
    }
  }, [note, isNew]);

  // When a tag is deleted its id disappears from allTags — strip it from
  // localTagIds so the tag section stays in sync automatically.
  useEffect(() => {
    if (tagsLoading) return;
    const validIds = new Set(allTags.map(t => t.id));
    setLocalTagIds(prev => prev.filter(id => validIds.has(id)));
  }, [allTags, tagsLoading]);

  // Track unsaved changes
  useEffect(() => {
    const normalize = (arr: string[]) => [...arr].sort();

    if (isNew) {
      setHasChanges(
        localTitle.trim() !== '' ||
        localReflection.trim() !== '' ||
        localTagIds.length > 0
      );
    } else if (note) {
      const titleChanged = localTitle !== note.title;
      const reflectionChanged = localReflection !== (note.reflection || '');
      const tagsChanged =
        JSON.stringify(normalize(localTagIds)) !==
        JSON.stringify(normalize(note.tags.map(t => t.id)));
      setHasChanges(titleChanged || reflectionChanged || tagsChanged);
    }
  }, [localTitle, localReflection, localTagIds, note, isNew]);

  // Notify sidebar of title changes during creation
  useEffect(() => {
    if (isNew) {
      onNewTitleChange?.(localTitle);
    }
  }, [localTitle, isNew, onNewTitleChange]);

  const handleSave = useCallback(() => {
    if (isNew) {
      const trimmedTitle = localTitle.trim();
      if (!trimmedTitle) return;

      setCreateError(null);
      createMutation.mutate(
        {
          title: trimmedTitle,
          reflection: localReflection.trim() || undefined,
          tagIds: localTagIds,
        },
        {
          onSuccess: (data) => onCreated?.(data.id),
          onError: () => setCreateError('Failed to create note'),
        }
      );
    } else {
      if (!noteId || !hasChanges) return;

      updateMutation.mutate({
        id: noteId,
        payload: {
          title: localTitle,
          reflection: localReflection,
          tagIds: localTagIds,
        },
      });
      onEditingChange?.(false);
    }
  }, [
    isNew, noteId, localTitle, localReflection, localTagIds, hasChanges,
    createMutation, updateMutation, onCreated, onEditingChange,
  ]);

  const handleCancel = useCallback(() => {
    if (isNew) {
      onCancelNew?.();
    } else if (note) {
      setLocalTitle(note.title);
      setLocalReflection(note.reflection || '');
      setLocalTagIds(note.tags.map(t => t.id));
      setHasChanges(false);
      onEditingChange?.(false);
    }
  }, [isNew, note, onEditingChange, onCancelNew]);

  const handleDelete = useCallback(() => {
    if (isNew) {
      // Trash button in new-note mode cancels creation
      onCancelNew?.();
      return;
    }
    if (!noteId) return;
    deleteMutation.mutate(noteId, { onSuccess: () => onDeleted?.() });
  }, [noteId, isNew, deleteMutation, onDeleted, onCancelNew]);

  // Helper: resolve a tag id → display name using allTags, falling back to
  // note.tags (cached) and finally the raw id so we never show a UUID.
  function resolveTagName(id: string): string {
    return (
      allTags.find(t => t.id === id)?.name ??
      note?.tags.find(t => t.id === id)?.name ??
      id
    );
  }

  // ---------------------------------------------------------------------------
  // Early returns
  // ---------------------------------------------------------------------------

  if (!noteId && !isNew) return <EmptyNoteState />;
  if (isLoading && !isNew) return <NoteDetailSkeleton />;
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

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------

  const showEditMode = isNew || isEditing;

  // TopBar wiring differs slightly between new and existing notes:
  //   • New note:      Done → save,  trash → cancel creation
  //   • Existing note: Done → save if changes then exit edit, Edit → enter edit mode, trash → delete
  const topBarProps = isNew
    ? {
        isEditing: true,          // always show "Done" while creating
        onToggleEdit: handleSave,
        onDeleteNote: handleCancel,
      }
    : {
        isEditing,
        onToggleEdit: () => {
          if (isEditing && hasChanges) {
            handleSave();
          } else {
            onEditingChange?.(!isEditing);
          }
        },
        onDeleteNote: handleDelete,
      };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="flex flex-col h-full">
      {/* TopBar — shown for both new and existing notes */}
      <TopBar {...topBarProps} />

      {/* Error banner (create mode only) */}
      {createError && (
        <div className="flex items-center gap-2 px-6 py-3 bg-destructive/10 text-destructive border-b border-destructive/20">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <p className="text-sm">{createError}</p>
        </div>
      )}

      {/* Title */}
      <div className="flex items-start gap-4 p-6 pb-4 border-b border-border">
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
            <h1 className="text-2xl font-semibold text-foreground truncate">
              {note?.title}
            </h1>
          )}
        </div>
      </div>

      {/* Tags section */}
      <div className="px-6 py-4 border-b border-border">
        {/* Tag pills + toggle button */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          {localTagIds.length > 0 ? (
            localTagIds.map(id => (
              <span key={id} className="px-2 py-1 text-xs bg-secondary rounded">
                {resolveTagName(id)}
              </span>
            ))
          ) : (
            <span className="text-sm text-muted-foreground italic">No tags</span>
          )}

          {/* Tag overlay toggle — only visible while editing */}
          {showEditMode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTagOverlayOpen(open => !open)}
              className={cn(
                'gap-1.5 ml-auto text-xs',
                tagOverlayOpen
                  ? 'text-primary hover:text-primary/90'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Tag className="w-3.5 h-3.5" />
              {tagOverlayOpen ? 'Close tags' : 'Edit tags'}
            </Button>
          )}
        </div>

        {/* Tag overlay — shown only when toggled open in edit mode */}
        {showEditMode && tagOverlayOpen && (
          <TagOverlay
            selectedTagIds={localTagIds}
            onChange={setLocalTagIds}
          />
        )}
      </div>

      {/* Reflection */}
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
              <p className="text-muted-foreground italic">
                No reflection yet. Click edit to add one.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Saving indicator (update mode) */}
      {updateMutation.isPending && !isNew && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 text-sm text-muted-foreground">
          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}