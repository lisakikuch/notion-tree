'use client';

import { useState } from 'react';
import { useTags, useCreateTag, useDeleteTag } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { ApiError } from '@/lib/apiClient';

interface TagOverlayProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagOverlay({
  selectedTagIds,
  onChange,
}: TagOverlayProps) {
  const { data: tagsData, isLoading } = useTags();
  const createTagMutation = useCreateTag();
  const deleteTagMutation = useDeleteTag();

  const [newTagName, setNewTagName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const tags = tagsData?.data ?? [];

  function toggle(tagId: string) {
    const exists = selectedTagIds.includes(tagId);
    const next = exists
      ? selectedTagIds.filter(id => id !== tagId)
      : [...selectedTagIds, tagId];

    onChange(next);
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
      {/* List */}
      <div className="max-h-48 overflow-y-auto mb-2">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          tags.map(tag => {
            const checked = selectedTagIds.includes(tag.id);

            return (
              <label
                key={tag.id}
                className="flex items-center gap-2 text-sm py-1"
              >
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

      {/* Create */}
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