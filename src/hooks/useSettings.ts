import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { WebSocketSettings, KioskSettings } from '@/types';

interface WebSocketSettingsRaw {
  url: string;
  reconnect_attempts: number;
  reconnect_delay: number;
}

interface KioskSettingsRaw {
  name: string;
  location: string;
  idle_timeout: number;
}

interface VenueSettings {
  venue_id: string;
  rfid_enabled?: boolean;
  upi_enabled?: boolean;
  upi_merchant_id?: string;
  theme?: string;
  brightness?: number;
  volume?: number;
  sound_effects_enabled?: boolean;
  password_protection_enabled?: boolean;
  admin_password?: string;
}

export function useSettings(venueId?: string | null) {
  const queryClient = useQueryClient();
  
  const fetchSettings = async (): Promise<VenueSettings | null> => {
    if (!venueId) return null;
    
    const { data, error } = await supabase
      .from('venue_settings')
      .select('*')
      .eq('venue_id', venueId)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    
    return data || {
      venue_id: venueId,
      rfid_enabled: true,
      upi_enabled: true,
      upi_merchant_id: '',
      theme: 'light',
      brightness: 100,
      volume: 50,
      sound_effects_enabled: true,
      password_protection_enabled: false,
      admin_password: ''
    };
  };
  
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['venue-settings', venueId],
    queryFn: fetchSettings,
    enabled: !!venueId
  });
  
  const updateSettings = useMutation({
    mutationFn: async (newSettings: Partial<VenueSettings>) => {
      const { error } = await supabase
        .from('venue_settings')
        .upsert(newSettings);
      
      if (error) throw error;
      return newSettings;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['venue-settings', venueId] });
      toast({
        title: "Settings updated",
        description: "Venue settings have been saved",
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
    settings,
    isLoading,
    error,
    updateSettings: (newSettings: Partial<VenueSettings>) => updateSettings.mutate(newSettings),
    isUpdating: updateSettings.isPending
  };
}

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
    
    // First cast to unknown, then to the specific type to avoid TypeScript errors
    const rawSettings = data.value as unknown as WebSocketSettingsRaw;
    
    return {
      url: rawSettings.url || 'ws://localhost:8081',
      reconnectAttempts: rawSettings.reconnect_attempts || 5,
      reconnectDelay: rawSettings.reconnect_delay || 2000
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
    
    // First cast to unknown, then to the specific type to avoid TypeScript errors
    const rawSettings = data.value as unknown as KioskSettingsRaw;
    
    return {
      name: rawSettings.name || 'VR Kiosk',
      location: rawSettings.location || 'Main Hall',
      idleTimeout: rawSettings.idle_timeout || 300
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
