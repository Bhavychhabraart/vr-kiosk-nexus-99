
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building } from "lucide-react";
import { useUserRoles } from "@/hooks/useUserRoles";

interface VenueFilterProps {
  selectedVenueId: string | null;
  onVenueChange: (venueId: string | null) => void;
}

const VenueFilter = ({ selectedVenueId, onVenueChange }: VenueFilterProps) => {
  const { userVenues, isSuperAdmin, isLoading } = useUserRoles();

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse h-10 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!userVenues || userVenues.length === 0) {
    return (
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-yellow-800 flex items-center gap-2">
            <Building className="h-4 w-4" />
            No Venues Assigned
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-yellow-700">
            You don't have access to any venues yet. Contact your super admin to get venue access.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          {isSuperAdmin ? "Filter by Venue (Optional)" : "Select Venue"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Select value={selectedVenueId || "all"} onValueChange={(value) => onVenueChange(value === "all" ? null : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select a venue" />
          </SelectTrigger>
          <SelectContent>
            {isSuperAdmin && (
              <SelectItem value="all">All Venues</SelectItem>
            )}
            {userVenues.map((venue) => (
              <SelectItem key={venue.id} value={venue.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{venue.name}</span>
                  <span className="text-xs text-muted-foreground">{venue.city}, {venue.state}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default VenueFilter;
