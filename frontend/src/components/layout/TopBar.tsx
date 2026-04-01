'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { TagOverlay } from '@/components/tags/TagOverlay';
import { Pencil, Check, Tag, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  noteId: string;
  currentTagIds: string[];
  isEditing: boolean;
  onToggleEdit: () => void;
  onDeleteNote: () => void;
}

export function TopBar({
  noteId,
  currentTagIds,
  isEditing,
  onToggleEdit,
  onDeleteNote,
}: TopBarProps) {
  const [isTagOverlayOpen, setIsTagOverlayOpen] = useState(false);
  const tagButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border bg-card">
      {/* Edit/Done toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleEdit}
        className={cn(
          'gap-2',
          isEditing
            ? 'text-primary hover:text-primary/90'
            : 'text-muted-foreground hover:text-foreground'
        )}
      >
        {isEditing ? (
          <>
            <Check className="w-4 h-4" />
            Done
          </>
        ) : (
          <>
            <Pencil className="w-4 h-4" />
            Edit
          </>
        )}
      </Button>

      {/* Tag button */}
      <div className="relative">
        <Button
          ref={tagButtonRef}
          variant="ghost"
          size="icon"
          onClick={() => setIsTagOverlayOpen(!isTagOverlayOpen)}
          className={cn(
            'text-muted-foreground hover:text-foreground',
            isTagOverlayOpen && 'bg-muted text-foreground'
          )}
          aria-expanded={isTagOverlayOpen}
          aria-haspopup="dialog"
        >
          <Tag className="w-4 h-4" />
          <span className="sr-only">Manage tags</span>
        </Button>

        <TagOverlay
          noteId={noteId}
          currentTagIds={currentTagIds}
          anchorRef={tagButtonRef}
          isOpen={isTagOverlayOpen}
          onClose={() => setIsTagOverlayOpen(false)}
        />
      </div>

      {/* Delete button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDeleteNote}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="w-4 h-4" />
        <span className="sr-only">Delete note</span>
      </Button>
    </div>
  );
}
