import { useState, useEffect } from 'react';

const useFileLoader = (loadFn: () => Promise<string>) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const data: string = await loadFn();
        setContent(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, [loadFn]);

  return { content, loading, error };
};

export { useFileLoader }