
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  Clock, 
  Star,
  ExternalLink,
  Calendar
} from "lucide-react";
import { useUpcomingProducts } from "@/hooks/useUpcomingProducts";

interface MachineProductCatalogTabProps {
  venueId: string;
}

const MachineProductCatalogTab = ({ venueId }: MachineProductCatalogTabProps) => {
  const { upcomingProducts, isLoading } = useUpcomingProducts();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Upcoming VR Experiences</h2>
          <p className="text-muted-foreground">
            New games and experiences coming to the platform
          </p>
        </div>
        <Badge variant="outline" className="px-4 py-2">
          {upcomingProducts?.length || 0} Coming Soon
        </Badge>
      </div>

      {upcomingProducts && upcomingProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingProducts.map((product) => (
            <Card key={product.id} className="overflow-hidden">
              {product.preview_image_url && (
                <div className="aspect-video bg-gradient-to-br from-vr-primary/20 to-vr-secondary/20">
                  <img 
                    src={product.preview_image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{product.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {product.category}
                      </Badge>
                      <Badge 
                        variant={product.status === 'coming_soon' ? 'secondary' : 'default'} 
                        className="text-xs"
                      >
                        {product.status === 'coming_soon' ? 'Coming Soon' : product.status}
                      </Badge>
                    </div>
                  </div>
                  {product.pre_order_available && (
                    <Star className="h-5 w-5 text-yellow-500" />
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {product.description || "An exciting new VR experience coming soon"}
                </p>

                <div className="space-y-2">
                  {product.release_date && (
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Release Date:</span>
                      </div>
                      <span className="font-semibold">
                        {new Date(product.release_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  {product.estimated_price && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Estimated Price:</span>
                      <span className="font-semibold text-green-600">
                        ₹{Number(product.estimated_price).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                {product.features && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Key Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(product.features as Record<string, any>).slice(0, 3).map(([key, value]) => (
                        <Badge key={key} variant="outline" className="text-xs">
                          {key.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  {product.trailer_url && (
                    <Button variant="outline" size="sm" className="flex-1">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Preview
                    </Button>
                  )}
                  {product.pre_order_available && (
                    <Button size="sm" className="flex-1">
                      Pre-Order
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No upcoming products</h3>
              <p className="text-muted-foreground">
                Check back later for new VR experiences and games
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MachineProductCatalogTab;
