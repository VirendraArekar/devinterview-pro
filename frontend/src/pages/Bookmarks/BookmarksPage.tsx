import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { bookmarkService } from '../../services/api';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Skeleton } from '../../components/common/Skeleton';
import {
  Bookmark,
  FileText,
  Trash2,
  ExternalLink,
  Plus,
  Save,
  Search,
} from 'lucide-react';
import { toast } from 'sonner';

export const BookmarksPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'notes' ? 'notes' : 'bookmarks';
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'notes'>(initialTab);

  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Note state
  const [showNewNote, setShowNewNote] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [bmList, noteList] = await Promise.all([
          bookmarkService.getBookmarks().catch(() => []),
          bookmarkService.getNotes().catch(() => []),
        ]);
        setBookmarks(bmList);
        setNotes(noteList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRemoveBookmark = async (itemType: string, itemId: number) => {
    try {
      await bookmarkService.toggleBookmark(itemType, itemId);
      setBookmarks(bookmarks.filter((b) => !(b.itemType === itemType && b.itemId === itemId)));
      toast.info('Bookmark removed');
    } catch {
      toast.error('Failed to remove bookmark');
    }
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim()) {
      toast.error('Note content cannot be empty');
      return;
    }
    try {
      const created = await bookmarkService.saveNote({
        itemType: 'GENERAL',
        title: noteTitle.trim() || 'General Revision Note',
        content: noteContent.trim(),
      });
      setNotes([created, ...notes]);
      setShowNewNote(false);
      setNoteTitle('');
      setNoteContent('');
      toast.success('Note saved successfully!');
    } catch {
      toast.error('Failed to save note');
    }
  };

  const handleDeleteNote = async (id: number) => {
    try {
      await bookmarkService.deleteNote(id);
      setNotes(notes.filter((n) => n.id !== id));
      toast.info('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Saved Bookmarks & Personal Notes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Access your flagged high-yield interview questions, challenges, and personal cheat-sheets.
          </p>
        </div>

        {activeTab === 'notes' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setShowNewNote(!showNewNote)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Quick Note
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 text-xs">
        <button
          onClick={() => {
            setActiveTab('bookmarks');
            setSearchParams({ tab: 'bookmarks' });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'bookmarks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Saved Bookmarks ({bookmarks.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('notes');
            setSearchParams({ tab: 'notes' });
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
            activeTab === 'notes'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>My Personal Notes ({notes.length})</span>
        </button>
      </div>

      {/* Tab 1: Bookmarks List */}
      {activeTab === 'bookmarks' && (
        <div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : bookmarks.length === 0 ? (
            <Card className="p-12 text-center text-slate-500">
              <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-40 text-indigo-400" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No bookmarks saved yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click the bookmark icon on any question or coding problem to pin it here.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((b) => (
                <Card key={b.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="indigo">{b.itemType}</Badge>
                      <span className="text-xs text-slate-400">
                        Saved on {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {b.details?.title || `Item #${b.itemId}`}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {b.itemType === 'QUESTION' && b.details?.slug && (
                      <Link to={`/questions/${b.details.slug}`}>
                        <Button size="sm" variant="secondary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Open
                        </Button>
                      </Link>
                    )}
                    {b.itemType === 'CODING_PROBLEM' && b.details?.slug && (
                      <Link to={`/coding/${b.details.slug}`}>
                        <Button size="sm" variant="secondary" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                          Solve
                        </Button>
                      </Link>
                    )}
                    <button
                      onClick={() => handleRemoveBookmark(b.itemType, b.itemId)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"
                      title="Remove bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Notes List */}
      {activeTab === 'notes' && (
        <div className="space-y-4">
          {/* Create Note Drawer */}
          {showNewNote && (
            <Card className="p-5 space-y-3 border-indigo-200 dark:border-indigo-900">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                New Personal Revision Note
              </h3>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note Title (e.g. JVM Garbage Collection Commands)"
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your personal notes, mnemonics, or syntax snippets..."
                rows={4}
                className="w-full text-xs sm:text-sm p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="flex justify-end gap-2">
                <Button size="sm" variant="ghost" onClick={() => setShowNewNote(false)}>
                  Cancel
                </Button>
                <Button size="sm" variant="primary" onClick={handleCreateNote} leftIcon={<Save className="w-3.5 h-3.5" />}>
                  Save Note
                </Button>
              </div>
            </Card>
          )}

          {notes.length === 0 && !showNewNote ? (
            <Card className="p-12 text-center text-slate-500">
              <FileText className="w-12 h-12 mx-auto mb-2 opacity-40 text-indigo-400" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No notes written yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Jot down personal reminders from questions or coding problems anytime.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notes.map((n) => (
                <Card key={n.id} className="p-5 flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {n.title}
                      </h3>
                      <button
                        onClick={() => handleDeleteNote(n.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete note"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                      {n.content}
                    </p>
                  </div>

                  <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 dark:border-slate-800">
                    Updated {new Date(n.updatedAt || n.createdAt).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
