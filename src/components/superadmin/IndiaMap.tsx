
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useVenues } from "@/hooks/useVenues";
import { VenueWithAnalytics } from "@/types/business";

const IndiaMap = () => {
  const { venues, isLoading } = useVenues();
  const [selectedVenue, setSelectedVenue] = useState<VenueWithAnalytics | null>(null);

  const stateCoordinates = {
    "Delhi": { x: 340, y: 180 },
    "Maharashtra": { x: 280, y: 300 },
    "Karnataka": { x: 300, y: 400 },
    "Tamil Nadu": { x: 320, y: 460 },
    "Telangana": { x: 340, y: 350 },
    "West Bengal": { x: 420, y: 240 },
    "Gujarat": { x: 240, y: 250 },
    "Rajasthan": { x: 280, y: 200 },
    "Uttar Pradesh": { x: 360, y: 200 },
    "Madhya Pradesh": { x: 320, y: 260 }
  };

  const getVenueColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981'; // Green
      case 'maintenance': return '#F59E0B'; // Yellow
      case 'offline': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-vr-primary"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="relative">
        {/* SVG Map Container */}
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-4 overflow-hidden">
          <svg
            viewBox="0 0 600 500"
            className="w-full h-96 drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
          >
            {/* India outline - simplified */}
            <path
              d="M200 100 L500 100 L520 150 L500 200 L480 250 L460 300 L440 350 L420 400 L400 450 L350 480 L300 490 L250 480 L200 450 L180 400 L160 350 L150 300 L160 250 L180 200 L200 150 Z"
              fill="rgba(99, 102, 241, 0.1)"
              stroke="rgba(99, 102, 241, 0.3)"
              strokeWidth="2"
            />
            
            {/* Venue markers */}
            {venues?.map((venue, index) => {
              const coords = stateCoordinates[venue.state as keyof typeof stateCoordinates];
              if (!coords) return null;

              return (
                <Tooltip key={venue.id}>
                  <TooltipTrigger asChild>
                    <circle
                      cx={coords.x}
                      cy={coords.y}
                      r="8"
                      fill={getVenueColor(venue.status || 'active')}
                      stroke="white"
                      strokeWidth="2"
                      className="cursor-pointer transition-all duration-200 hover:r-10"
                      onClick={() => setSelectedVenue(venue)}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-center">
                      <p className="font-semibold">{venue.name}</p>
                      <p className="text-sm">{venue.city}, {venue.state}</p>
                      <Badge 
                        variant={venue.status === 'active' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {venue.status}
                      </Badge>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </svg>
        </div>

        {/* Venue Details Panel */}
        {selectedVenue && (
          <Card className="absolute top-4 right-4 w-80 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">{selectedVenue.name}</h3>
                <Badge variant={selectedVenue.status === 'active' ? 'default' : 'secondary'}>
                  {selectedVenue.status}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Location:</span> {selectedVenue.city}, {selectedVenue.state}</p>
                <p><span className="font-medium">Address:</span> {selectedVenue.address}</p>
                <p><span className="font-medium">Manager:</span> {selectedVenue.manager_name}</p>
                <p><span className="font-medium">Phone:</span> {selectedVenue.manager_phone}</p>
                <p><span className="font-medium">Model:</span> {selectedVenue.machine_model}</p>
              </div>

              <div className="flex gap-2 mt-4">
                <button 
                  className="px-3 py-1 bg-vr-primary text-white rounded text-sm hover:bg-vr-primary/80"
                  onClick={() => console.log('View details for', selectedVenue.id)}
                >
                  View Details
                </button>
                <button 
                  className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  onClick={() => setSelectedVenue(null)}
                >
                  Close
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="flex gap-4 mt-4 justify-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-green-500"></div>
            <span className="text-sm">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span className="text-sm">Offline</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default IndiaMap;
