
import React, { createContext, useContext, useState, useCallback } from 'react';
import { QueryClient } from '@tanstack/react-query';

interface RefreshContextType {
  isRefreshing: boolean;
  lastRefresh: Date;
  triggerRefresh: () => void;
  softRefresh: () => void;
  hardRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export const useRefresh = () => {
  const context = useContext(RefreshContext);
  if (!context) {
    throw new Error('useRefresh must be used within a RefreshProvider');
  }
  return context;
};

interface RefreshProviderProps {
  children: React.ReactNode;
  queryClient: QueryClient;
}

export const RefreshProvider = ({ children, queryClient }: RefreshProviderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const softRefresh = useCallback(async () => {
    console.log('Performing soft refresh - invalidating all queries');
    setIsRefreshing(true);
    setLastRefresh(new Date());
    
    try {
      // Invalidate all queries to force refetch
      await queryClient.invalidateQueries();
      console.log('All queries invalidated successfully');
    } catch (error) {
      console.error('Error during soft refresh:', error);
    } finally {
      // Reset refreshing state after queries are invalidated
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    }
  }, [queryClient]);

  const hardRefresh = useCallback(() => {
    console.log('Performing hard refresh - reloading page');
    setIsRefreshing(true);
    
    // Give visual feedback before reload
    setTimeout(() => {
      window.location.reload();
    }, 500);
  }, []);

  // Default refresh is soft refresh
  const triggerRefresh = useCallback(() => {
    softRefresh();
  }, [softRefresh]);

  return (
    <RefreshContext.Provider value={{ 
      isRefreshing, 
      lastRefresh, 
      triggerRefresh, 
      softRefresh, 
      hardRefresh 
    }}>
      {children}
    </RefreshContext.Provider>
  );
};
