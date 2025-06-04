import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Clock,
  Star,
  Play,
  X,
  ChevronLeft,
  Users,
  LayoutGrid,
  Film,
  IndianRupee
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useGames } from "@/hooks/useGames";

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trailerOpen, setTrailerOpen] = useState(searchParams.get("showTrailer") === "true");
  const [isLoading, setIsLoading] = useState(true);
  const [game, setGame] = useState<GameDetails | null>(null);
  
  // Get games data from hook
  const { games } = useGames();

  // Load game data from games API
  useEffect(() => {
    console.log("Loading game with ID:", id);
    console.log("Available games:", games);
    
    setIsLoading(true);
    
    if (games && games.length > 0 && id) {
      // Find the game in our games list
      const foundGame = games.find(g => g.id === id);
      
      if (foundGame) {
        console.log("Found game in API:", foundGame);
        // Transform the game data to match our detailed view format
        const gameData = getEnhancedGameDetails(foundGame);
        setGame(gameData);
      } else {
        console.log("Game not found in API, trying mock data");
        // If game not in API results, try mock data as fallback
        const mockGame = getMockGameById(id);
        if (mockGame) {
          console.log("Found game in mock data:", mockGame);
          setGame(mockGame);
        } else {
          console.log("Game not found anywhere");
          // No game found in either source
          toast({
            title: "Game not found",
            description: "The requested game could not be found.",
            variant: "destructive"
          });
        }
      }
    } else if (id) {
      console.log("No games loaded yet, trying mock data");
      // If no games loaded yet or no id, try to get from mock data
      const mockGame = getMockGameById(id);
      if (mockGame) {
        console.log("Found game in mock data (fallback):", mockGame);
        setGame(mockGame);
      }
    }
    
    setIsLoading(false);
  }, [id, games, toast]);

  // Handle trailer dialog open state from URL param
  useEffect(() => {
    if (searchParams.get("showTrailer") === "true") {
      setTrailerOpen(true);
    }
  }, [searchParams]);

  // Handle closing trailer and updating URL
  const handleCloseTrailer = () => {
    setTrailerOpen(false);
    searchParams.delete("showTrailer");
    setSearchParams(searchParams);
  };

  // Handle playing the game - now goes directly to launch options
  const handlePlayGame = () => {
    if (!id || !game) {
      toast({
        title: "Error",
        description: "Game information not available.",
        variant: "destructive"
      });
      return;
    }

    // Navigate directly to launch options page
    const params = new URLSearchParams({
      gameId: id,
      title: game.title
    });
    
    navigate(`/launch-options?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="h-12 w-12 border-4 border-vr-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </MainLayout>
    );
  }

  if (!game) {
    return (
      <MainLayout>
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold mb-4">Game not found</h2>
          <p className="text-vr-muted mb-6">The requested game could not be found in our library.</p>
          <Button onClick={() => navigate("/games")}>
            Back to Games
          </Button>
        </div>
      </MainLayout>
    );
  }

  const hasTrailer = !!game.trailerUrl;

  return (
    <MainLayout className="relative">
      {/* Back button */}
      <Button
        variant="ghost" 
        className="absolute top-0 left-0 text-vr-muted hover:text-vr-text mb-4"
        onClick={() => navigate("/games")}
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back to Games
      </Button>

      {/* Hero Section */}
      <div 
        className="w-full h-[400px] rounded-2xl mt-12 mb-8 relative"
        style={{
          backgroundImage: `linear-gradient(to top, rgba(11, 14, 24, 0.9), rgba(11, 14, 24, 0.3)), url(${game.coverImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <Button 
            className="rounded-full bg-vr-primary/80 hover:bg-vr-primary w-16 h-16 flex items-center justify-center animate-pulse-glow"
            onClick={() => {
              if (hasTrailer) {
                setTrailerOpen(true);
                searchParams.set("showTrailer", "true");
                setSearchParams(searchParams);
              } else {
                toast({
                  title: "No trailer available",
                  description: "This game does not have a trailer yet.",
                  variant: "default"
                });
              }
            }}
          >
            <Play className="h-8 w-8 fill-white text-white ml-1" />
          </Button>
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {game.title}
              </h1>
              <div className="flex flex-wrap gap-2 mb-4">
                {game.categories.map((category, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 rounded-full bg-vr-primary/30 text-vr-secondary text-xs"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-4 md:mt-0">
              <Button 
                className="vr-button flex-1 md:flex-none"
                onClick={handlePlayGame}
              >
                Play Now
              </Button>
              <Button
                variant="outline"
                className={`border-vr-primary/50 text-vr-text hover:bg-vr-primary/20 flex-1 md:flex-none ${!hasTrailer ? 'opacity-70' : ''}`}
                onClick={() => {
                  if (hasTrailer) {
                    setTrailerOpen(true);
                    searchParams.set("showTrailer", "true");
                    setSearchParams(searchParams);
                  } else {
                    toast({
                      title: "No trailer available",
                      description: "This game does not have a trailer yet.",
                      variant: "default"
                    });
                  }
                }}
                disabled={!hasTrailer}
              >
                {hasTrailer ? "Watch Trailer" : "No Trailer"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="space-y-8">
        {/* Game Description and Info */}
        <div className="vr-card">
          <h2 className="text-2xl font-bold mb-4">About this game</h2>
          <p className="text-vr-muted mb-6">{game.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <InfoCard icon={<Clock className="h-5 w-5 text-vr-primary" />} title="Duration" value={game.duration} />
            <InfoCard icon={<Star className="h-5 w-5 text-vr-secondary" />} title="Rating" value={game.rating.toString()} />
            <InfoCard icon={<Users className="h-5 w-5 text-vr-accent" />} title="Players" value={game.players} />
            <InfoCard icon={<LayoutGrid className="h-5 w-5 text-green-400" />} title="Age Rating" value={game.ageRating} />
          </div>
          
          <Button
            className="w-full vr-button-secondary"
            onClick={handlePlayGame}
          >
            <Play className="h-5 w-5 mr-2" />
            Start Playing
          </Button>
        </div>
      </div>

      {/* Trailer Dialog */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="sm:max-w-[900px] bg-vr-dark border border-vr-primary/30">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{game.title} - Trailer</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={handleCloseTrailer}
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          <div className="aspect-video relative">
            {hasTrailer ? (
              <iframe
                className="w-full h-full"
                src={game.trailerUrl}
                title={`${game.title} trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-vr-dark/80">
                <div className="text-center">
                  <Film className="h-16 w-16 text-vr-muted mx-auto mb-4" />
                  <p className="text-vr-muted">No trailer available for this game.</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const InfoCard = ({ icon, title, value }: InfoCardProps) => {
  return (
    <div className="bg-vr-dark/50 border border-vr-primary/10 p-3 rounded-lg">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <h4 className="text-xs text-vr-muted">{title}</h4>
      </div>
      <p className="font-medium">{value}</p>
    </div>
  );
};

// Helper function to convert API game data to detailed format
const getEnhancedGameDetails = (game: any): GameDetails => {
  // Extract category from description if available
  const categories = game.description 
    ? game.description.split(',').map((cat: string) => cat.trim()) 
    : ['Uncategorized'];
  
  return {
    id: game.id,
    title: game.title,
    description: game.description || "No description available for this game.",
    coverImage: game.image_url || "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=1600&auto=format&fit=crop",
    trailerUrl: game.trailer_url || "",
    categories: categories,
    rating: 4.5, // Default rating
    duration: "5-20 min",
    players: "Single Player",
    ageRating: "E for Everyone",
  };
};

// Types and mock data
interface GameDetails {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  trailerUrl?: string;
  categories: string[];
  rating: number;
  duration: string;
  players: string;
  ageRating: string;
}

// Mock function to get game by ID - supporting both string and number IDs
function getMockGameById(id: string): GameDetails | null {
  const games: Record<string, GameDetails> = {
    "1": {
      id: "1",
      title: "Beat Saber",
      description: "Beat Saber is a VR rhythm game where your goal is to slash the beats which fit perfectly into precisely handcrafted music. Every beat indicates which saber you need to use and the direction you need to match. All the music is composed to perfectly fit the handmade levels. Our goal is to make players almost dance while cutting the cubes and avoiding obstacles.",
      coverImage: "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=1600&auto=format&fit=crop",
      trailerUrl: "https://www.youtube.com/embed/vL39Sg2AqWg",
      categories: ["Rhythm", "Action", "Music"],
      rating: 4.9,
      duration: "5-20 min",
      players: "Single Player",
      ageRating: "E for Everyone",
    },
    "2": {
      id: "2",
      title: "Half-Life: Alyx",
      description: "Half-Life: Alyx is Valve's VR return to the Half-Life series. It's the story of an impossible fight against a vicious alien race known as the Combine, set between the events of Half-Life and Half-Life 2. Playing as Alyx Vance, you are humanity's only chance for survival.",
      coverImage: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1600&auto=format&fit=crop",
      trailerUrl: "https://www.youtube.com/embed/O2W0N3uKXmo",
      categories: ["Adventure", "Shooter", "Action"],
      rating: 4.8,
      duration: "5-20 min",
      players: "Single Player",
      ageRating: "M for Mature",
    },
    "3": {
      id: "3",
      title: "Superhot VR",
      description: "SUPERHOT VR is a virtual reality first-person shooter video game. Time in the game progresses only when the player moves, allowing for a unique gameplay experience where players can plan their actions in slow-motion. The game features multiple locations and gives players access to a variety of weapons.",
      coverImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1600&auto=format&fit=crop",
      trailerUrl: "https://www.youtube.com/embed/pzG7Wc6mbwE",
      categories: ["Action", "Strategy", "Shooter"],
      rating: 4.7,
      duration: "5-20 min",
      players: "Single Player",
      ageRating: "T for Teen",
    },
    "f469ed8e-682c-48e2-8621-b311fbbcc4c3": {
      id: "f469ed8e-682c-48e2-8621-b311fbbcc4c3",
      title: "VR Adventure Quest",
      description: "An immersive VR adventure that takes you through mystical lands filled with puzzles, creatures, and epic battles. Experience the next generation of virtual reality gaming.",
      coverImage: "https://images.unsplash.com/photo-1592478411213-6153e4ebc696?q=80&w=1600&auto=format&fit=crop",
      trailerUrl: "",
      categories: ["Adventure", "Fantasy", "Action"],
      rating: 4.6,
      duration: "5-20 min",
      players: "Single Player",
      ageRating: "T for Teen",
    },
    "768ce333-6745-4f9f-9250-7165b5b92153": {
      id: "768ce333-6745-4f9f-9250-7165b5b92153",
      title: "Space Explorer VR",
      description: "Explore the vastness of space in this incredible VR experience. Navigate through asteroid fields, discover new planets, and engage in thrilling space battles.",
      coverImage: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?q=80&w=1600&auto=format&fit=crop",
      trailerUrl: "",
      categories: ["Space", "Exploration", "Simulation"],
      rating: 4.5,
      duration: "5-20 min",
      players: "Single Player",
      ageRating: "E for Everyone",
    },
    "62534d81-7e81-4b7d-8d07-26ecb2431174": {
      id: "62534d81-7e81-4b7d-8d07-26ecb2431174",
      title: "Racing Thunder VR",
      description: "Feel the adrenaline rush in this high-speed VR racing game. Race through stunning environments with realistic physics and compete against AI drivers in intense races.",
      coverImage: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=1600&auto=format&fit=crop",
      trailerUrl: "",
      categories: ["Racing", "Sports", "Simulation"],
      rating: 4.4,
      duration: "5-20 min",
      players: "Single Player",
      ageRating: "E for Everyone",
    }
  };

  return games[id] || null;
}

export default GameDetail;
