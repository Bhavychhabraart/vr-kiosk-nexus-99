
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Package,
  Plus,
  Star,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Clock,
  Play,
  Gamepad,
  Zap
} from "lucide-react";
import { useUpcomingProducts } from "@/hooks/useUpcomingProducts";
import { toast } from "@/components/ui/use-toast";

interface ProductCatalogTabProps {
  selectedVenueId?: string | null;
}

const ProductCatalogTab = ({ selectedVenueId }: ProductCatalogTabProps) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'coming_soon': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pre_order': return 'text-green-600 bg-green-50 border-green-200';
      case 'beta_testing': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'coming_soon': return 'Coming Soon';
      case 'pre_order': return 'Pre-Order Available';
      case 'beta_testing': return 'Beta Testing';
      default: return status;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'simulation': return <Gamepad className="h-4 w-4" />;
      case 'adventure': return <Star className="h-4 w-4" />;
      case 'fitness': return <Zap className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  // Group products by status
  const featuredProducts = upcomingProducts?.filter(p => p.is_featured) || [];
  const comingSoonProducts = upcomingProducts?.filter(p => p.status === 'coming_soon') || [];
  const betaProducts = upcomingProducts?.filter(p => p.demo_available) || [];

  return (
    <div className="space-y-6">
      {selectedVenueId && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Venue Filter Active:</strong> Showing product catalog for selected venue
          </p>
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Catalog</h2>
          <p className="text-muted-foreground">
            Discover upcoming VR games and experiences
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {upcomingProducts?.length || 0} Products
        </Badge>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-vr-primary" />
            Featured Products
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredProducts.map((product) => (
              <Card key={product.id} className="border-vr-primary/30 bg-gradient-to-br from-vr-primary/5 to-vr-secondary/5">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getCategoryIcon(product.category)}
                        {product.name}
                      </CardTitle>
                      <CardDescription className="mt-2">
                        {product.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(product.status)}>
                      {getStatusLabel(product.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <span>{product.category}</span>
                    </div>
                    {product.estimated_price && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span>₹{Number(product.estimated_price).toLocaleString()}</span>
                      </div>
                    )}
                    {product.release_date && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>{new Date(product.release_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {product.features && (
                    <div>
                      <p className="text-sm font-medium mb-2">Key Features:</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.keys(product.features as any).slice(0, 3).map((feature) => (
                          <Badge key={feature} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {product.pre_order_available && (
                      <Button size="sm" className="bg-vr-primary hover:bg-vr-primary/80">
                        Pre-Order Now
                      </Button>
                    )}
                    {product.demo_available && (
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Try Demo
                      </Button>
                    )}
                    {product.trailer_url && (
                      <Button size="sm" variant="outline">
                        <Play className="h-4 w-4 mr-1" />
                        Watch Trailer
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Products Grid */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Package className="h-5 w-5 text-vr-secondary" />
          All Upcoming Products
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingProducts?.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {getCategoryIcon(product.category)}
                      {product.name}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={`mt-2 ${getStatusColor(product.status)}`}
                    >
                      {getStatusLabel(product.status)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {product.description}
                </p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{product.category}</span>
                  </div>
                  
                  {product.estimated_price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-semibold text-green-600">
                        ₹{Number(product.estimated_price).toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {product.release_date && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-muted-foreground">Release:</span>
                      <span className="font-medium">
                        {new Date(product.release_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  {product.pre_order_available && (
                    <Button size="sm" className="flex-1">
                      Pre-Order
                    </Button>
                  )}
                  {product.demo_available && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      Demo
                    </Button>
                  )}
                  {!product.pre_order_available && !product.demo_available && (
                    <Button size="sm" variant="outline" className="flex-1" disabled>
                      <Clock className="h-4 w-4 mr-1" />
                      Coming Soon
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {(!upcomingProducts || upcomingProducts.length === 0) && (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No products available yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for exciting new VR experiences
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProductCatalogTab;
