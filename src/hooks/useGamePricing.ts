
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface DurationPackage {
  duration_minutes: number;
  price: number;
}

interface GamePricing {
  id: string;
  venue_id: string;
  game_id: string;
  base_price: number;
  price_per_minute: number;
  duration_packages: DurationPackage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateGamePricingData {
  venue_id: string;
  game_id: string;
  base_price: number;
  price_per_minute: number;
  duration_packages?: DurationPackage[];
  is_active?: boolean;
}

export const useGamePricing = (venueId?: string) => {
  const queryClient = useQueryClient();

  // Fetch game pricing for a venue
  const { data: gamePricing, isLoading, error } = useQuery({
    queryKey: ['game-pricing', venueId],
    queryFn: async (): Promise<GamePricing[]> => {
      if (!venueId) return [];

      const { data, error } = await supabase
        .from('game_pricing')
        .select('*')
        .eq('venue_id', venueId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Parse the duration_packages JSON field
      return (data || []).map(item => ({
        ...item,
        duration_packages: Array.isArray(item.duration_packages) 
          ? item.duration_packages as DurationPackage[]
          : []
      }));
    },
    enabled: !!venueId
  });

  // Create or update game pricing
  const updateGamePricing = useMutation({
    mutationFn: async (pricingData: CreateGamePricingData) => {
      const { data, error } = await supabase
        .from('game_pricing')
        .upsert(pricingData, {
          onConflict: 'venue_id,game_id'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['game-pricing'] });
      toast({
        title: "Success",
        description: "Game pricing updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Get pricing for a specific game
  const getGamePrice = (gameId: string) => {
    return gamePricing?.find(pricing => pricing.game_id === gameId);
  };

  // Calculate total price for a game session
  const calculatePrice = (gameId: string, durationMinutes: number) => {
    const pricing = getGamePrice(gameId);
    if (!pricing) return 0;

    // Check if there's a duration package that matches
    const packagePrice = pricing.duration_packages?.find(
      pkg => pkg.duration_minutes === durationMinutes
    );

    if (packagePrice) {
      return packagePrice.price;
    }

    // Otherwise calculate based on base price + per minute pricing
    return pricing.base_price + (pricing.price_per_minute * durationMinutes);
  };

  return {
    gamePricing,
    isLoading,
    error,
    updateGamePricing,
    getGamePrice,
    calculatePrice
  };
};
