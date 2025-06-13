
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Clock, Play, Pause } from 'lucide-react';
import { format } from 'date-fns';

interface GlobalRefreshProps {
  onRefresh: () => void;
  isLoading?: boolean;
  lastUpdated?: Date;
}

const GlobalRefresh = ({ onRefresh, isLoading, lastUpdated }: GlobalRefreshProps) => {
  const [autoRefresh, setAutoRefresh] = useState<string>('off');
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isAutoRefreshActive && autoRefresh !== 'off') {
      const seconds = parseInt(autoRefresh);
      setCountdown(seconds);
      
      interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            onRefresh();
            return seconds;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAutoRefreshActive, autoRefresh, onRefresh]);

  const handleAutoRefreshToggle = () => {
    setIsAutoRefreshActive(!isAutoRefreshActive);
    if (!isAutoRefreshActive && autoRefresh === 'off') {
      setAutoRefresh('30'); // Default to 30 seconds
    }
  };

  const handleRefreshIntervalChange = (value: string) => {
    setAutoRefresh(value);
    if (value === 'off') {
      setIsAutoRefreshActive(false);
      setCountdown(0);
    } else if (isAutoRefreshActive) {
      setCountdown(parseInt(value));
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2">
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Now
        </Button>
        
        <Button
          onClick={handleAutoRefreshToggle}
          variant={isAutoRefreshActive ? "default" : "outline"}
          size="sm"
          className="flex items-center gap-2"
        >
          {isAutoRefreshActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          Auto Refresh
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Interval:</span>
        <Select value={autoRefresh} onValueChange={handleRefreshIntervalChange}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="off">Off</SelectItem>
            <SelectItem value="30">30 seconds</SelectItem>
            <SelectItem value="60">1 minute</SelectItem>
            <SelectItem value="300">5 minutes</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {isAutoRefreshActive && countdown > 0 && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Next refresh in {countdown}s
          </Badge>
        )}
        
        {lastUpdated && (
          <div className="text-xs text-muted-foreground">
            Last updated: {format(lastUpdated, 'HH:mm:ss')}
          </div>
        )}
      </div>
    </div>
  );
};

export default GlobalRefresh;
