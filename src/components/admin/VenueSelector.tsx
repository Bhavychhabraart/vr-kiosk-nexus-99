
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useVenues } from "@/hooks/useVenues";
import { Building2 } from "lucide-react";

interface VenueSelectorProps {
  selectedVenueId?: string;
  onVenueSelect: (venueId: string) => void;
}

const VenueSelector = ({ selectedVenueId, onVenueSelect }: VenueSelectorProps) => {
  const { venues, isLoading, error } = useVenues();

  console.log('VenueSelector - venues:', venues, 'loading:', isLoading, 'error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        Loading venues...
      </div>
    );
  }

  if (error) {
    console.error('Error loading venues:', error);
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <Building2 className="h-4 w-4" />
        Error loading venues: {error.message}
      </div>
    );
  }

  if (!venues || venues.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Building2 className="h-4 w-4" />
        No venues found
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Building2 className="h-4 w-4 text-muted-foreground" />
      <Select value={selectedVenueId} onValueChange={onVenueSelect}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a venue to configure" />
        </SelectTrigger>
        <SelectContent>
          {venues.map((venue) => (
            <SelectItem key={venue.id} value={venue.id}>
              <div className="flex flex-col">
                <span className="font-medium">{venue.name}</span>
                <span className="text-xs text-muted-foreground">
                  {venue.city}, {venue.state}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default VenueSelector;
