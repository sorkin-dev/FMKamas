import { useEffect } from 'react';

interface Shortcuts {
  onFocusSearch?: () => void;
  onGetRecommendation?: () => void;
  onSaveSession?: () => void;
  onUndoAttempt?: () => void;
}

export function useKeyboardShortcuts(shortcuts: Shortcuts): void {
  useEffect(() => {
    const handler = (e: KeyboardEvent): void => {
      const ctrl = e.ctrlKey || e.metaKey;
      if (ctrl && e.key === 'f') { e.preventDefault(); shortcuts.onFocusSearch?.(); }
      if (ctrl && e.key === 'r') { e.preventDefault(); shortcuts.onGetRecommendation?.(); }
      if (ctrl && e.key === 's') { e.preventDefault(); shortcuts.onSaveSession?.(); }
      if (ctrl && e.key === 'z') { e.preventDefault(); shortcuts.onUndoAttempt?.(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [shortcuts]);
}
