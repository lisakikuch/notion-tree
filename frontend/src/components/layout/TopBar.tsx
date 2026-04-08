'use client';

import { Button } from '@/components/ui/button';
import { Pencil, Check, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
  isEditing: boolean;
  onToggleEdit: () => void;
  onDeleteNote: () => void;
}

export function TopBar({
  isEditing,
  onToggleEdit,
  onDeleteNote,
}: TopBarProps) {
  return (
    <div className="flex items-center justify-end gap-2 px-4 py-2 border-b border-border bg-card">
      {/* Edit / Done */}
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

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onDeleteNote}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}