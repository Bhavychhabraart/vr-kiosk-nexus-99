
import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
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
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Game Library</h1>
        <p className="text-vr-muted">Browse our collection of VR games.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-vr-muted h-4 w-4" />
          <Input
            placeholder="Search games..."
            className="pl-10 bg-vr-dark border-vr-primary/30 focus:border-vr-primary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full md:w-[180px] bg-vr-dark border-vr-primary/30">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-vr-dark border-vr-primary/30">
            <SelectItem value="all">All Categories</SelectItem>
            {uniqueCategories.map(category => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-vr-secondary" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <h3 className="text-xl font-medium text-vr-accent mb-2">Error loading games</h3>
          <p className="text-vr-muted mb-6">Please try again later</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} />
            ))}
          </div>

          {filteredGames.length === 0 && (
            <div className="text-center py-12">
              <h3 className="text-xl font-medium text-vr-muted mb-2">No games found</h3>
              <p className="text-vr-muted mb-6">Try changing your search or filter criteria</p>
              <Button 
                variant="outline" 
                className="border-vr-primary/50 text-vr-text hover:bg-vr-primary/20"
                onClick={() => {
                  setCategory("all");
                  setSearchQuery("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </>
      )}
    </MainLayout>
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
      className="vr-card cursor-pointer group h-full flex flex-col"
      onClick={() => navigate(`/game/${game.id}`)}
    >
      <div className="aspect-[16/9] overflow-hidden rounded-lg mb-3 relative">
        <img 
          src={imageUrl} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            // Fallback to a default image if the specified one fails to load
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop";
          }}
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-vr-dark/70 px-2 py-1 rounded-md text-xs backdrop-blur-sm">
          <Star className="h-3 w-3 fill-vr-secondary text-vr-secondary" />
          <span className="text-vr-text">4.5</span>
        </div>
        {hasTrailer && (
          <div className="absolute bottom-2 right-2">
            <div className="bg-vr-secondary/90 text-vr-dark p-1 rounded-full w-6 h-6 flex items-center justify-center">
              <Film className="h-3 w-3" />
            </div>
          </div>
        )}
      </div>
      <h3 className="text-lg font-medium group-hover:text-vr-secondary transition-colors">
        {game.title}
      </h3>
      <span className="text-sm text-vr-muted capitalize">{category}</span>
    </div>
  );
};

export default Games;
