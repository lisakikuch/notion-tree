'use client';

import { useState } from 'react';
import { useInfiniteInterests } from '@/hooks/useInterests';
import { useTags } from '@/hooks/useTags';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus, ArrowUpDown, LogOut, FileText, Search, X } from 'lucide-react';

export const TEMP_NEW_NOTE_ID = '__new__';

interface SidebarProps {
  selectedNoteId?: string;
  onSelectNote: (id: string) => void;
  onAddNote: () => void;
  onLogout?: () => void;
  tempNewNoteTitle?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return date.toLocaleDateString('en-US', { weekday: 'short' });
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function LoadingSkeleton() {
  return (
    <div className="space-y-2 p-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-3 animate-pulse">
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
      <p className="text-xs text-muted-foreground">Create your first note to get started</p>
    </div>
  );
}

export function Sidebar({
  selectedNoteId,
  onSelectNote,
  onAddNote,
  onLogout,
  tempNewNoteTitle,
}: SidebarProps) {
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // ── filter draft state (what the user is typing / toggling) ──
  const [keywordDraft, setKeywordDraft] = useState('');
  const [tagDraft, setTagDraft] = useState<string[]>([]);

  // ── applied state (sent to the API only after clicking Search) ──
  const [appliedKeyword, setAppliedKeyword] = useState<string | undefined>(undefined);
  const [appliedTagIds, setAppliedTagIds] = useState<string[] | undefined>(undefined);

  const { data: tagsData } = useTags();
  const allTags = tagsData?.data ?? [];

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteInterests(sortOrder, appliedKeyword, appliedTagIds);

  function toggleSort() {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  }

  function toggleTagDraft(id: string) {
    setTagDraft((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function applyFilters() {
    setAppliedKeyword(keywordDraft.length >= 2 ? keywordDraft : undefined);
    setAppliedTagIds(tagDraft.length > 0 ? tagDraft : undefined);
  }

  function clearFilters() {
    setKeywordDraft('');
    setTagDraft([]);
    setAppliedKeyword(undefined);
    setAppliedTagIds(undefined);
  }

  const hasActiveFilter =
    (appliedKeyword && appliedKeyword.length >= 2) ||
    (appliedTagIds && appliedTagIds.length > 0);

  const notes = data?.pages.flatMap((page) => page.data) ?? [];
  const isCreatingNew = selectedNoteId === TEMP_NEW_NOTE_ID;
  const hasNotes = notes.length > 0 || isCreatingNew;

  return (
    <aside className="flex h-full w-72 flex-col border-r border-border bg-sidebar">
      {/* Header: sort + add */}
      <div className="flex items-center justify-between border-b border-border px-3 h-[52px]">
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
        <Button variant="default" size="icon-sm" onClick={onAddNote} aria-label="Add new note">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Filter section */}
      <div className="border-b border-border p-3 space-y-2">
        {/* Keyword input */}
        <input
          type="text"
          value={keywordDraft}
          onChange={(e) => setKeywordDraft(e.target.value)}
          placeholder="Search keyword…"
          className="w-full rounded-md border border-input bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />

        {/* Tag toggles — only render if tags exist */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {allTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTagDraft(tag.id)}
                className={cn(
                  'rounded-full px-2 py-0.5 text-xs font-medium transition-colors',
                  tagDraft.includes(tag.id)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/70'
                )}
              >
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex gap-1.5">
          <Button
            size="sm"
            variant="default"
            className="flex-1 gap-1 text-xs h-7"
            onClick={applyFilters}
          >
            <Search className="h-3 w-3" />
            Search
          </Button>
          {hasActiveFilter && (
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-xs h-7 text-muted-foreground"
              onClick={clearFilters}
              aria-label="Clear filters"
            >
              <X className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
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
            {isCreatingNew && (
              <button
                onClick={() => onSelectNote(TEMP_NEW_NOTE_ID)}
                className={cn(
                  'w-full rounded-lg border p-3 text-left transition-colors',
                  'border-primary/30 bg-primary/10'
                )}
                aria-current="true"
              >
                <p className="truncate text-sm font-medium text-foreground mb-1.5">
                  {tempNewNoteTitle || 'Untitled'}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground shrink-0">Just now</span>
                </div>
              </button>
            )}
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
                  <time dateTime={note.updatedAt} className="text-xs text-muted-foreground shrink-0">
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
            {hasNextPage && (
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? 'Loading...' : 'Load more'}
                </Button>
              </div>
            )}
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