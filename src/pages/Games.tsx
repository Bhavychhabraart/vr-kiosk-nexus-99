
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
import { Search, Star } from "lucide-react";

const Games = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  
  const [category, setCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Mock games data - in production, this would come from an API
  const allGames = [
    {
      id: 1,
      title: "Beat Saber",
      category: "action",
      image: "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop",
      rating: 4.9,
    },
    {
      id: 2,
      title: "Half-Life: Alyx",
      category: "adventure",
      image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
      rating: 4.8,
    },
    {
      id: 3,
      title: "Superhot VR",
      category: "action",
      image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
      rating: 4.7,
    },
    {
      id: 4,
      title: "Moss",
      category: "adventure",
      image: "https://images.unsplash.com/photo-1626379961798-54b76fb1a8da?q=80&w=800&auto=format&fit=crop",
      rating: 4.6,
    },
    {
      id: 5,
      title: "The Room VR",
      category: "puzzle",
      image: "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=800&auto=format&fit=crop",
      rating: 4.5,
    },
    {
      id: 6,
      title: "Star Wars: Squadrons",
      category: "simulation",
      image: "https://images.unsplash.com/photo-1561089489-f13d5e730d72?q=80&w=800&auto=format&fit=crop",
      rating: 4.4,
    },
    {
      id: 7,
      title: "Arizona Sunshine",
      category: "action",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop",
      rating: 4.3,
    },
    {
      id: 8,
      title: "Tetris Effect",
      category: "puzzle",
      image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=800&auto=format&fit=crop",
      rating: 4.7,
    },
    {
      id: 9,
      title: "No Man's Sky VR",
      category: "simulation",
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop",
      rating: 4.2,
    }
  ];

  // Filter games based on category and search query
  const filteredGames = allGames.filter((game) => {
    const matchesCategory = category === "all" || game.category === category;
    const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
            <SelectItem value="action">Action</SelectItem>
            <SelectItem value="adventure">Adventure</SelectItem>
            <SelectItem value="puzzle">Puzzle</SelectItem>
            <SelectItem value="simulation">Simulation</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
    </MainLayout>
  );
};

interface GameCardProps {
  game: {
    id: number;
    title: string;
    category: string;
    image: string;
    rating: number;
  };
}

const GameCard = ({ game }: GameCardProps) => {
  const navigate = useNavigate();
  
  return (
    <div 
      className="vr-card cursor-pointer group h-full flex flex-col"
      onClick={() => navigate(`/games/${game.id}`)}
    >
      <div className="aspect-[16/9] overflow-hidden rounded-lg mb-3 relative">
        <img 
          src={game.image} 
          alt={game.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-vr-dark/70 px-2 py-1 rounded-md text-xs backdrop-blur-sm">
          <Star className="h-3 w-3 fill-vr-secondary text-vr-secondary" />
          <span className="text-vr-text">{game.rating}</span>
        </div>
      </div>
      <h3 className="text-lg font-medium group-hover:text-vr-secondary transition-colors">
        {game.title}
      </h3>
      <span className="text-sm text-vr-muted capitalize">{game.category}</span>
    </div>
  );
};

export default Games;
