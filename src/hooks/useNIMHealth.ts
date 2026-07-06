import { useState, useEffect, useCallback, useRef } from 'react';

export interface NIMServiceHealth {
  id: string;
  name: string;
  url: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latency: number;
  type: 'NIM_LIVE' | 'NIM_EMULATED';
  sslStatus: string;
  region: string;
  error: string | null;
  lastChecked: string;
}

export interface NIMHealthData {
  timestamp: string;
  overallStatus: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  apiKeyConfigured: boolean;
  services: NIMServiceHealth[];
}

export function useNIMHealth() {
  const [healthData, setHealthData] = useState<NIMHealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefetching, setIsRefetching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Keep track of active fetch abort controllers to prevent state updates on unmounted hooks
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchHealth = useCallback(async (manual = false) => {
    if (manual) {
      setIsRefetching(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    // Abort previous active request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await fetch('/api/bionemo/ping', {
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch health status: ${response.statusText}`);
      }

      const data: NIMHealthData = await response.json();
      setHealthData(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching NVIDIA NIM health status:', err);
        setError(err.message || 'Unknown connectivity issue');
      }
    } finally {
      setIsLoading(false);
      setIsRefetching(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchHealth();

    // 30 seconds polling interval
    const intervalId = setInterval(() => {
      fetchHealth();
    }, 30000);

    return () => {
      clearInterval(intervalId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchHealth]);

  const refetch = useCallback(() => {
    return fetchHealth(true);
  }, [fetchHealth]);

  return {
    healthData,
    overallStatus: healthData?.overallStatus || 'DOWN',
    apiKeyConfigured: healthData?.apiKeyConfigured || false,
    services: healthData?.services || [],
    isLoading,
    isRefetching,
    error,
    refetch,
  };
}
