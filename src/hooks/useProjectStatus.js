import { useState, useCallback, useEffect } from 'react';
import { getLaunchedProject } from '../api';

export const useProjectStatus = (namespace, moduleName) => {
  const [projectStatus, setProjectStatus] = useState({
    isSalesEnded: false,
    isInitLiquidity: false,
    distributionRoundCompleted: 0,
    loading: true,
    error: null
  });

  const fetchProjectStatus = useCallback(async () => {
    if (!namespace || !moduleName) {
      setProjectStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setProjectStatus(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await getLaunchedProject(namespace, moduleName);
      
      if (response?.data?.data?.project) {
        const project = response.data.data.project;
        setProjectStatus({
          isSalesEnded: project.isSalesEnded || false,
          isInitLiquidity: project.isInitLiquidity || false,
          distributionRoundCompleted: project.distributionRoundCompleted || 0,
          loading: false,
          error: null
        });
      } else {
        setProjectStatus({
          isSalesEnded: false,
          isInitLiquidity: false,
          distributionRoundCompleted: 0,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error('Error fetching project status:', error);
      setProjectStatus(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch project status'
      }));
    }
  }, [namespace, moduleName]);

  // Fetch status on mount and when dependencies change
  useEffect(() => {
    fetchProjectStatus();
  }, [fetchProjectStatus]);

  // Return status and refresh function
  return {
    ...projectStatus,
    refreshStatus: fetchProjectStatus
  };
};

export default useProjectStatus;
