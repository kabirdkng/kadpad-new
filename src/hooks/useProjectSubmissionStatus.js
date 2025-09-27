import { useState, useEffect, useCallback, useRef } from 'react';
import { checkProjectByContract } from '../api';
import { toast } from 'react-toastify';

/**
 * Custom hook for real-time project submission status updates in the launch page
 * @param {Object} tokenDetails - Token details containing contractAddress
 * @param {Object} options - Configuration options
 * @param {number} options.pollingInterval - Polling interval in milliseconds (default: 10000)
 * @param {boolean} options.enablePolling - Whether to enable polling (default: true)
 * @param {boolean} options.pollingOnFocus - Whether to poll when window gains focus (default: true)
 * @param {boolean} options.showNotifications - Whether to show toast notifications on status changes
 * @returns {Object} Project status data and controls
 */
export const useProjectSubmissionStatus = (tokenDetails, options = {}) => {
  const {
    pollingInterval = 10000, // 10 seconds
    enablePolling = true,
    pollingOnFocus = true,
    showNotifications = true
  } = options;

  const [project, setProject] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isPollingActive, setIsPollingActive] = useState(false);

  const pollingIntervalRef = useRef(null);
  const isFetchingRef = useRef(false);
  const lastStatusRef = useRef(null);
  const mountedRef = useRef(true);

  // Helper function to get status display names
  const getStatusDisplayName = useCallback((status) => {
    const statusNames = {
      'pending': 'Pending Review',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'awaiting_fees': 'Awaiting Fees',
      'ready_to_launch': 'Ready to Launch',
      'sales_configured': 'Sales Configured',
      'launched': 'Launched'
    };
    return statusNames[status] || status;
  }, []);

  // Function to fetch project status
  const fetchProjectStatus = useCallback(async (showLoading = false) => {
    if (!tokenDetails?.contractAddress || isFetchingRef.current) {
      return;
    }

    isFetchingRef.current = true;
    
    if (showLoading) {
      setIsLoading(true);
    }
    
    try {
      const [namespace, moduleName] = tokenDetails.contractAddress.split('.');
      const response = await checkProjectByContract(namespace, moduleName);
      
      if (response.data.data.project) {
        const existingProject = response.data.data.project;
        const newStatus = existingProject.status;
        
        // Check if status has changed and show notification
        if (showNotifications && lastStatusRef.current && lastStatusRef.current !== newStatus) {
          const statusDisplayName = getStatusDisplayName(newStatus);
          
          // Different toast types based on status
          if (newStatus === 'approved') {
            toast.success(`🎉 Great news! Your project has been approved: ${statusDisplayName}`);
          } else if (newStatus === 'rejected') {
            toast.error(`Your project status changed to: ${statusDisplayName}`);
          } else if (newStatus === 'sales_configured') {
            toast.success(`✅ Sales configuration complete! Status: ${statusDisplayName}`);
          } else {
            toast.info(`Project status updated to: ${statusDisplayName}`);
          }
        }
        
        setProject(existingProject);
        setSubmissionStatus(newStatus);
        lastStatusRef.current = newStatus;
        setError(null);
        
        // Start polling if we have a project and it's not already polling
        if (enablePolling && pollingIntervalRef.current === null) {
          // Start polling directly here to avoid circular dependency
          if (enablePolling && tokenDetails?.contractAddress) {
            setIsPollingActive(true);
            pollingIntervalRef.current = setInterval(() => {
              fetchProjectStatus(false);
            }, pollingInterval);
          }
        }
      } else {
        setProject(null);
        setSubmissionStatus(null);
        lastStatusRef.current = null;
      }
      
        setLastUpdated(new Date());
    } catch (err) {
      if (err.response?.status === 404) {
        // 404 is expected when no project exists yet - not an error
        setProject(null);
        setSubmissionStatus(null);
        lastStatusRef.current = null;
        setError(null);
      } else if (err.code === 'DUPLICATE_REQUEST') {
        // Duplicate request blocked - this is fine, just ignore it
        setError(null);
      } else {
        console.error('Error fetching project status:', err);
        setError(err.message || 'Failed to fetch project status');
      }
    } finally {
      isFetchingRef.current = false;
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [tokenDetails, showNotifications, getStatusDisplayName, enablePolling, pollingInterval]);  // Manual refresh function
  const refreshStatus = useCallback(() => {
    fetchProjectStatus(true);
  }, [fetchProjectStatus]);

  // Start polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    if (enablePolling && tokenDetails?.contractAddress) {
      setIsPollingActive(true);
      pollingIntervalRef.current = setInterval(() => {
        fetchProjectStatus(false);
      }, pollingInterval);
    }
  }, [fetchProjectStatus, enablePolling, pollingInterval, tokenDetails]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPollingActive(false);
  }, []);

  // Initial fetch and setup polling
  useEffect(() => {
    if (tokenDetails?.contractAddress) {
      fetchProjectStatus(true);
      // Only start polling if we find a project exists
      // The polling will be started in the fetchProjectStatus success callback
    } else {
      setProject(null);
      setSubmissionStatus(null);
      lastStatusRef.current = null;
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [tokenDetails, fetchProjectStatus, stopPolling]);

  // Handle window focus for immediate updates
  useEffect(() => {
    if (!pollingOnFocus) return;

    const handleFocus = () => {
      if (tokenDetails?.contractAddress) {
        fetchProjectStatus(false);
      }
    };

    const handleBlur = () => {
      // Optional: Could pause polling when window loses focus to save resources
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [fetchProjectStatus, pollingOnFocus, tokenDetails?.contractAddress]);

  // Handle page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (tokenDetails?.contractAddress) {
          fetchProjectStatus(false);
        }
        if (enablePolling) {
          startPolling();
        }
      } else {
        stopPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchProjectStatus, startPolling, stopPolling, tokenDetails?.contractAddress, enablePolling]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      stopPolling();
    };
  }, [stopPolling]);

  return {
    project,
    submissionStatus,
    isLoading,
    error,
    lastUpdated,
    isPollingActive,
    refreshStatus,
    startPolling,
    stopPolling,
    getStatusDisplayName
  };
};

export default useProjectSubmissionStatus;