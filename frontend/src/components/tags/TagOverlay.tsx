'use client';

import { useState, useRef, useEffect } from 'react';
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/useTags';
import { useUpdateInterest, interestKeys } from '@/hooks/useInterests';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ApiError } from '@/lib/apiClient';

interface TagOverlayProps {
  noteId: string;
  currentTagIds: string[];
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  isOpen: boolean;
  onClose: () => void;
}

function TagRowSkeleton() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 animate-pulse">
      <div className="w-4 h-4 bg-muted rounded" />
      <div className="flex-1 h-4 bg-muted rounded" />
      <div className="w-4 h-4 bg-muted rounded" />
    </div>
  );
}

export function TagOverlay({
  noteId,
  currentTagIds,
  anchorRef,
  isOpen,
  onClose,
}: TagOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data: tagsData, isLoading: isLoadingTags } = useTags();
  const createTagMutation = useCreateTag();
  const deleteTagMutation = useDeleteTag(noteId);
  const updateInterestMutation = useUpdateInterest();

  const [newTagName, setNewTagName] = useState('');
  const [createError, setCreateError] = useState<string | null>(null);

  const tags = tagsData?.data ?? [];

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const isClickInsideOverlay = overlayRef.current?.contains(target);
      const isClickOnAnchor = anchorRef.current?.contains(target);

      if (!isClickInsideOverlay && !isClickOnAnchor) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  // Handle tag toggle (attach/detach)
  function handleTagToggle(tagId: string, isCurrentlyAttached: boolean) {
    const newTagIds = isCurrentlyAttached
      ? currentTagIds.filter((id) => id !== tagId)
      : [...currentTagIds, tagId];

    updateInterestMutation.mutate(
      { id: noteId, payload: { tagIds: newTagIds } },
      {
        onSuccess: (data) => {
          queryClient.setQueryData(interestKeys.detail(noteId), data);
          queryClient.invalidateQueries({ queryKey: interestKeys.lists() });
        },
      }
    );
  }

  // Handle create new tag
  function handleCreateTag(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = newTagName.trim();
    if (!trimmedName) return;

    setCreateError(null);
    createTagMutation.mutate(
      { name: trimmedName },
      {
        onSuccess: () => {
          setNewTagName('');
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 409) {
            setCreateError('A tag with this name already exists');
          } else {
            setCreateError(error instanceof Error ? error.message : 'Failed to create tag');
          }
        },
      }
    );
  }

  // Handle delete tag
  function handleDeleteTag(tagId: string) {
    deleteTagMutation.mutate(tagId);
  }

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={cn(
        'absolute z-50 w-72 bg-card border border-border rounded-lg shadow-lg',
        'top-full right-0 mt-2'
      )}
      role="dialog"
      aria-label="Manage tags"
    >
      {/* Tag list */}
      <div className="max-h-64 overflow-y-auto">
        {isLoadingTags ? (
          <div className="py-2">
            <TagRowSkeleton />
            <TagRowSkeleton />
            <TagRowSkeleton />
          </div>
        ) : tags.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">No tags yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create one below</p>
          </div>
        ) : (
          <ul className="py-2" role="listbox">
            {tags.map((tag) => {
              const isAttached = currentTagIds.includes(tag.id);
              const isDeleting = deleteTagMutation.isPending && deleteTagMutation.variables === tag.id;

              return (
                <li
                  key={tag.id}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 hover:bg-muted/50 transition-colors',
                    isDeleting && 'opacity-50 pointer-events-none'
                  )}
                >
                  <input
                    type="checkbox"
                    id={`tag-${tag.id}`}
                    checked={isAttached}
                    onChange={() => handleTagToggle(tag.id, isAttached)}
                    disabled={updateInterestMutation.isPending}
                    className={cn(
                      'w-4 h-4 rounded border-border text-primary',
                      'focus:ring-primary focus:ring-offset-0'
                    )}
                  />
                  <label
                    htmlFor={`tag-${tag.id}`}
                    className="flex-1 text-sm text-foreground cursor-pointer truncate"
                  >
                    {tag.name}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleDeleteTag(tag.id)}
                    disabled={isDeleting}
                    className={cn(
                      'p-1 text-muted-foreground hover:text-destructive transition-colors',
                      'rounded hover:bg-destructive/10'
                    )}
                    aria-label={`Delete tag ${tag.name}`}
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Create new tag form */}
      <form
        onSubmit={handleCreateTag}
        className="border-t border-border p-3"
      >
        {createError && (
          <div className="flex items-center gap-2 mb-2 text-destructive">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <p className="text-xs">{createError}</p>
          </div>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => {
              setNewTagName(e.target.value);
              setCreateError(null);
            }}
            placeholder="New tag name..."
            className={cn(
              'flex-1 px-3 py-1.5 text-sm rounded-md',
              'bg-background border border-input',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            )}
          />
          <Button
            type="submit"
            size="sm"
            disabled={!newTagName.trim() || createTagMutation.isPending}
            className="bg-primary hover:bg-primary/90"
          >
            {createTagMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
