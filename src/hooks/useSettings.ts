
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WebSocketSettings, KioskSettings } from '@/types';

export function useWebSocketSettings() {
  const queryClient = useQueryClient();
  
  const fetchWebSocketSettings = async (): Promise<WebSocketSettings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'websocket')
      .single();
      
    if (error) throw error;
    
    if (!data?.value) {
      return {
        url: 'ws://localhost:8081',
        reconnectAttempts: 5,
        reconnectDelay: 2000
      };
    }
    
    return {
      url: data.value.url || 'ws://localhost:8081',
      reconnectAttempts: data.value.reconnect_attempts || 5,
      reconnectDelay: data.value.reconnect_delay || 2000
    };
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['websocket-settings'],
    queryFn: fetchWebSocketSettings
  });
  
  const updateSettings = useMutation({
    mutationFn: async (newSettings: WebSocketSettings) => {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: 'websocket', 
          value: {
            url: newSettings.url,
            reconnect_attempts: newSettings.reconnectAttempts,
            reconnect_delay: newSettings.reconnectDelay
          }
        });
      
      if (error) throw error;
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websocket-settings'] });
      toast({
        title: "Settings updated",
        description: "WebSocket connection settings have been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    settings: data,
    isLoading,
    error,
    updateSettings: (newSettings: WebSocketSettings) => updateSettings.mutate(newSettings),
    isUpdating: updateSettings.isPending
  };
}

export function useKioskSettings() {
  const queryClient = useQueryClient();
  
  const fetchKioskSettings = async (): Promise<KioskSettings> => {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('id', 'kiosk')
      .single();
      
    if (error) throw error;
    
    if (!data?.value) {
      return {
        name: 'VR Kiosk',
        location: 'Main Hall',
        idleTimeout: 300
      };
    }
    
    return {
      name: data.value.name || 'VR Kiosk',
      location: data.value.location || 'Main Hall',
      idleTimeout: data.value.idle_timeout || 300
    };
  };
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['kiosk-settings'],
    queryFn: fetchKioskSettings
  });
  
  const updateSettings = useMutation({
    mutationFn: async (newSettings: KioskSettings) => {
      const { error } = await supabase
        .from('settings')
        .upsert({ 
          id: 'kiosk', 
          value: {
            name: newSettings.name,
            location: newSettings.location,
            idle_timeout: newSettings.idleTimeout
          }
        });
      
      if (error) throw error;
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kiosk-settings'] });
      toast({
        title: "Settings updated",
        description: "Kiosk settings have been saved",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating settings",
        description: error.message,
        variant: "destructive",
      });
    }
  });
  
  return {
    settings: data,
    isLoading,
    error,
    updateSettings: (newSettings: KioskSettings) => updateSettings.mutate(newSettings),
    isUpdating: updateSettings.isPending
  };
}
