'use client';

import { useState } from 'react';
import { useInterests } from '@/hooks/useInterests';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, ArrowUpDown, LogOut, FileText } from 'lucide-react';

interface SidebarProps {
  selectedNoteId?: string;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onLogout?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  }
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-3 animate-pulse"
        >
          <div className="h-4 w-3/4 rounded bg-muted mb-2" />
          <div className="flex items-center justify-between">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="flex gap-1">
              <div className="h-5 w-12 rounded-full bg-muted" />
              <div className="h-5 w-10 rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 p-6 text-center">
      <div className="rounded-full bg-muted p-3 mb-3">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-foreground mb-1">No notes yet</p>
      <p className="text-xs text-muted-foreground">
        Create your first note to get started
      </p>
    </div>
  );
}

export function Sidebar({
  selectedNoteId,
  onSelectNote,
  onAddNote,
  onLogout,
}: SidebarProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { data, isLoading, error } = useInterests({ sort: sortOrder });

  function toggleSort() {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }

  const notes = data?.data ?? [];
  const hasNotes = notes.length > 0;

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSort}
          className="gap-1.5 text-xs text-muted-foreground hover:text-foreground"
          aria-label={`Sort ${sortOrder === 'desc' ? 'oldest first' : 'newest first'}`}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
        </Button>
        <Button
          variant="default"
          size="icon-sm"
          onClick={onAddNote}
          aria-label="Add new note"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingSkeleton />
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-sm text-destructive">Failed to load notes</p>
          </div>
        ) : !hasNotes ? (
          <EmptyState />
        ) : (
          <nav className="space-y-1 p-2" aria-label="Notes list">
            {notes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  'hover:bg-accent hover:border-accent-foreground/20',
                  'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                  selectedNoteId === note.id
                    ? 'border-primary/30 bg-primary/10'
                    : 'border-transparent bg-card'
                )}
                aria-current={selectedNoteId === note.id ? 'true' : undefined}
              >
                <p className="truncate text-sm font-medium text-foreground mb-1.5">
                  {note.title}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <time
                    dateTime={note.updatedAt}
                    className="text-xs text-muted-foreground shrink-0"
                  >
                    {formatDate(note.updatedAt)}
                  </time>
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-end min-w-0">
                      {note.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground truncate max-w-20"
                        >
                          {tag.name}
                        </span>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                          +{note.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onLogout}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>
    </aside>
  );
}
