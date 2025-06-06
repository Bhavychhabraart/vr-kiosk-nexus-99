
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Film, Loader2, Search, Star } from "lucide-react";
import { useGames } from "@/hooks/useGames";
import { MinimalNav } from "@/components/ui/minimal-nav";
import { AnimatedOrbs } from "@/components/ui/animated-orbs";
import { MinimalStatus } from "@/components/ui/minimal-status";

const Games = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  
  const [category, setCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  const { games, isLoading, error } = useGames();

  // Extract unique categories from games
  const uniqueCategories = games 
    ? Array.from(new Set(games.map(game => 
        game.description?.toLowerCase().split(",")[0] || "uncategorized"
      )))
    : [];
  
  // Filter games based on category and search query
  const filteredGames = games?.filter((game) => {
    // Only show active games on the public games page
    if (!game.is_active) return false;
    
    const gameCategory = game.description?.toLowerCase().split(",")[0] || "uncategorized";
    const matchesCategory = category === "all" || gameCategory.includes(category.toLowerCase());
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  }) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-vr-dark via-gray-900 to-vr-dark relative overflow-hidden">
      {/* Enhanced Background */}
      <AnimatedOrbs intensity="low" orbCount={4} />
      
      {/* Minimal Status & Navigation */}
      <MinimalStatus status="connected" />
      <MinimalNav showBack title="Game Library" />

      {/* Main Content */}
      <div className="relative z-10 pt-20 pb-8 px-8">
        <div className="container mx-auto max-w-7xl">
          
          {/* Modern Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              <span className="bg-gradient-to-r from-vr-primary via-vr-accent to-vr-secondary bg-clip-text text-transparent">
                Game Library
              </span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Discover immersive VR experiences crafted for next-generation gaming
            </p>
          </div>

          {/* Floating Search & Filter Bar */}
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-6 mb-8 shadow-2xl">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50 h-5 w-5" />
                <Input
                  placeholder="Search immersive experiences..."
                  className="pl-12 h-12 bg-white/10 border-white/20 focus:border-vr-primary text-white placeholder:text-white/50 rounded-xl backdrop-blur-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full md:w-[200px] h-12 bg-white/10 border-white/20 text-white rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="bg-vr-dark/95 backdrop-blur-xl border-white/20 rounded-xl">
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map(category => (
                    <SelectItem key={category} value={category} className="text-white">
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Games Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-vr-primary" />
                <p className="text-white/60">Loading experiences...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-medium text-red-400 mb-2">Error loading games</h3>
                <p className="text-white/60 mb-6">Please try again later</p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} />
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="text-center py-12">
                  <div className="backdrop-blur-xl bg-white/5 border border-white/20 rounded-3xl p-8 max-w-md mx-auto">
                    <h3 className="text-xl font-medium text-white mb-2">No experiences found</h3>
                    <p className="text-white/60 mb-6">Try adjusting your search or filter criteria</p>
                    <Button 
                      variant="outline" 
                      className="border-vr-primary/50 text-vr-primary hover:bg-vr-primary/20 hover:text-white rounded-xl"
                      onClick={() => {
                        setCategory("all");
                        setSearchQuery("");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Enhanced ambient effects */}
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-vr-secondary/5 rounded-full blur-[150px] -translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-96 h-96 bg-vr-primary/5 rounded-full blur-[150px] translate-x-1/2" />
    </div>
  );
};

interface GameCardProps {
  game: {
    id: string;
    title: string;
    description?: string | null;
    image_url?: string | null;
    trailer_url?: string | null;
  };
}

const GameCard = ({ game }: GameCardProps) => {
  const navigate = useNavigate();
  const category = game.description?.split(",")[0] || "Uncategorized";
  const hasTrailer = !!game.trailer_url;
  
  // Use a default image if no image_url is provided
  const imageUrl = game.image_url || "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop";
  
  return (
    <div 
      className="group cursor-pointer h-full flex flex-col backdrop-blur-xl bg-white/5 border border-white/20 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-2xl"
      onClick={() => navigate(`/games/${game.id}`)}
    >
      <div className="aspect-[16/9] overflow-hidden relative">
        <img 
          src={imageUrl} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            // Fallback to a default image if the specified one fails to load
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop";
          }}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-xs">
          <Star className="h-3 w-3 fill-vr-secondary text-vr-secondary" />
          <span className="text-white font-medium">4.5</span>
        </div>
        
        {/* Trailer indicator */}
        {hasTrailer && (
          <div className="absolute bottom-3 right-3 bg-vr-accent/90 backdrop-blur-sm text-white p-1.5 rounded-full w-7 h-7 flex items-center justify-center">
            <Film className="h-3 w-3" />
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-white group-hover:text-vr-primary transition-colors duration-300 mb-1">
          {game.title}
        </h3>
        <span className="text-xs text-white/50 uppercase tracking-wider font-medium">{category}</span>
        
        {/* Hover effect bar */}
        <div className="mt-auto pt-3">
          <div className="w-0 h-0.5 bg-gradient-to-r from-vr-primary to-vr-accent group-hover:w-full transition-all duration-500" />
        </div>
      </div>
    </div>
  );
};

export default Games;
