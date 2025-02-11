import { useState, useEffect } from "react";

const useAutoSave = <T>(content: T | null, saveFn: (content: T) => Promise<unknown>, delay = 1000) => {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!content) return;
      
      setSaving(true);
      try {
        await saveFn(content);
        setLastSaved(new Date());
        setSaveError(null);
      } catch (err) {
        setSaveError(err);
      } finally {
        setSaving(false);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [content, saveFn, delay]);

  return { saving, lastSaved, saveError };
};

export { useAutoSave };
