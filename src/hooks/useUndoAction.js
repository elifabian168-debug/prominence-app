import { useState, useEffect } from 'react';

export function useUndoAction() {
  const [undoAction, setUndoAction] = useState(null);

  // Reactively clear undo at its deadline instead of checking Date.now() in render
  useEffect(() => {
    if (!undoAction) return;
    const remaining = undoAction.deadline - Date.now();
    if (remaining <= 0) { setUndoAction(null); return; }
    const id = setTimeout(() => setUndoAction(null), remaining);
    return () => clearTimeout(id);
  }, [undoAction]);

  return { undoAction, setUndoAction };
}
