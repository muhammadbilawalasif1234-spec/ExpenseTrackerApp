import { useEffect, useState } from "react";
export function useFirestore<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void collectionName;
    setData([]);
    setError(null);
    setLoading(false);
  }, [collectionName]);

  return { data, loading, error };
}
