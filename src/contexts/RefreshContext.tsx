
import React, { createContext, useContext, useState, useCallback } from 'react';

interface RefreshContextType {
  isRefreshing: boolean;
  lastRefresh: Date;
  triggerRefresh: () => void;
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
}

export const RefreshProvider = ({ children }: RefreshProviderProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastRefresh(new Date());
    
    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, []);

  return (
    <RefreshContext.Provider value={{ isRefreshing, lastRefresh, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};
