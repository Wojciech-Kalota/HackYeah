import { useCallback, useEffect, useState } from 'react';

import { getApiErrorMessage, type ApiIdea } from './client';
import { loadReports, type ApiCatalog } from './reports';
import type { Report } from '../utils/dummyData';

export function useReportsData() {
  const [reports, setReports] = useState<Report[]>([]);
  const [ideas, setIdeas] = useState<ApiIdea[]>([]);
  const [catalog, setCatalog] = useState<ApiCatalog>({
    categories: [],
    districts: [],
    statuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loadReports();
      setReports(data.reports);
      setIdeas(data.ideas);
      setCatalog(data.catalog);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { reports, ideas, catalog, loading, error, reload };
}
