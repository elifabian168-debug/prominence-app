import { useState } from 'react';
import { ACCENT } from '../constants/theme';

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, color = ACCENT) => {
    const id = Date.now();
    setToast({ id, message, color });
    setTimeout(() => setToast(t => t?.id === id ? null : t), 2400);
  };

  return { toast, showToast };
}
