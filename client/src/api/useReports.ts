import { useCallback, useEffect, useState } from 'react';

import { getApiErrorMessage, type ApiIdea } from './client';
import { loadReports, type ApiCatalog, type ReportQuery } from './reports';
import type { Report } from '../types/domain';

export function useReportsData(options: ReportQuery = {}) {
  const {
    district,
    category,
    status,
    query,
    authoredByMe,
    page = 1,
    pageSize = 100,
  } = options;
  const [reports, setReports] = useState<Report[]>([]);
  const [ideas, setIdeas] = useState<ApiIdea[]>([]);
  const [catalog, setCatalog] = useState<ApiCatalog>({
    categories: [],
    districts: [],
    statuses: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: page,
    pageSize,
    pageCount: 0,
    totalCount: 0,
    totalPages: 0,
  });

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await loadReports({
        district,
        category,
        status,
        query,
        authoredByMe,
        page,
        pageSize,
      });
      setReports(data.reports);
      setIdeas(data.ideas);
      setCatalog(data.catalog);
      setPagination({
        currentPage: data.currentPage,
        pageSize: data.pageSize,
        pageCount: data.pageCount,
        totalCount: data.totalCount,
        totalPages: data.totalPages,
      });
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [authoredByMe, category, district, page, pageSize, query, status]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { reports, ideas, catalog, loading, error, pagination, reload };
}
