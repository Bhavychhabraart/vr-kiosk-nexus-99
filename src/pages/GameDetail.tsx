
import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Clock,
  Star,
  Play,
  X,
  ChevronLeft,
  Timer,
  Users,
  Cpu,
  LayoutGrid
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const GameDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trailerOpen, setTrailerOpen] = useState(searchParams.get("showTrailer") === "true");
  const [isLoading, setIsLoading] = useState(true);
  const [game, setGame] = useState<GameDetails | null>(null);

  // Mock game data - in production, this would come from an API fetch
  useEffect(() => {
    // Simulate API loading
    setIsLoading(true);
    
    // Mock API call with timeout
    setTimeout(() => {
      const gameData = getMockGameById(Number(id));
      if (gameData) {
        setGame(gameData);
      } else {
        // Game not found
        toast({
          title: "Game not found",
          description: "The requested game could not be found.",
          variant: "destructive"
        });
        navigate("/games");
      }
      setIsLoading(false);
    }, 800);
  }, [id, navigate, toast]);

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

  // Handle playing the game
  const handlePlayGame = () => {
    toast({
      title: "Starting game...",
      description: `Launching ${game?.title}. Please put on your VR headset.`,
    });
    
    // In a real implementation, this would send a command to the C++ server
    // For now, we'll just simulate by navigating to the session page
    setTimeout(() => {
      navigate(`/session?gameId=${id}&title=${game?.title}`);
    }, 2000);
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
          <Button onClick={() => navigate("/games")}>
            Back to Games
          </Button>
        </div>
      </MainLayout>
    );
  }

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
              setTrailerOpen(true);
              searchParams.set("showTrailer", "true");
              setSearchParams(searchParams);
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
                className="border-vr-primary/50 text-vr-text hover:bg-vr-primary/20 flex-1 md:flex-none"
                onClick={() => {
                  setTrailerOpen(true);
                  searchParams.set("showTrailer", "true");
                  setSearchParams(searchParams);
                }}
              >
                Watch Trailer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Description */}
        <div className="vr-card lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">About this game</h2>
          <p className="text-vr-muted mb-6">{game.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <InfoCard icon={<Clock className="h-5 w-5 text-vr-primary" />} title="Duration" value={game.duration} />
            <InfoCard icon={<Star className="h-5 w-5 text-vr-secondary" />} title="Rating" value={game.rating.toString()} />
            <InfoCard icon={<Users className="h-5 w-5 text-vr-accent" />} title="Players" value={game.players} />
            <InfoCard icon={<LayoutGrid className="h-5 w-5 text-green-400" />} title="Age Rating" value={game.ageRating} />
          </div>
          
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-3">Screenshots</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {game.screenshots.map((screenshot, index) => (
                <div 
                  key={index}
                  className="aspect-video rounded-lg overflow-hidden"
                >
                  <img 
                    src={screenshot} 
                    alt={`${game.title} screenshot ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Right Column - System Requirements */}
        <div className="flex flex-col gap-6">
          <div className="vr-card">
            <div className="flex items-center gap-2 mb-4">
              <Cpu className="h-5 w-5 text-vr-secondary" />
              <h2 className="text-xl font-bold">System Requirements</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-vr-muted text-sm mb-1">Headset</h3>
                <p>{game.systemRequirements.headset}</p>
              </div>
              <div>
                <h3 className="text-vr-muted text-sm mb-1">Processor</h3>
                <p>{game.systemRequirements.processor}</p>
              </div>
              <div>
                <h3 className="text-vr-muted text-sm mb-1">Graphics</h3>
                <p>{game.systemRequirements.graphics}</p>
              </div>
              <div>
                <h3 className="text-vr-muted text-sm mb-1">Memory</h3>
                <p>{game.systemRequirements.memory}</p>
              </div>
            </div>
          </div>
          
          <div className="vr-card">
            <div className="flex items-center gap-2 mb-4">
              <Timer className="h-5 w-5 text-vr-secondary" />
              <h2 className="text-xl font-bold">Session Info</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-vr-muted text-sm mb-1">Standard Session</h3>
                <p>30 minutes - $15.00</p>
              </div>
              <div>
                <h3 className="text-vr-muted text-sm mb-1">Extended Session</h3>
                <p>60 minutes - $25.00</p>
              </div>
              <Button
                className="w-full vr-button-secondary mt-4"
                onClick={handlePlayGame}
              >
                Start Session
              </Button>
            </div>
          </div>
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
            <div className="absolute inset-0 flex items-center justify-center bg-vr-dark/80">
              <p className="text-vr-muted">Video trailer would play here in the actual application.</p>
            </div>
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

// Types and mock data
interface GameDetails {
  id: number;
  title: string;
  description: string;
  coverImage: string;
  trailerUrl?: string;
  screenshots: string[];
  categories: string[];
  rating: number;
  duration: string;
  players: string;
  ageRating: string;
  systemRequirements: {
    headset: string;
    processor: string;
    graphics: string;
    memory: string;
  };
}

// Mock function to get game by ID
function getMockGameById(id: number): GameDetails | null {
  const games: Record<number, GameDetails> = {
    1: {
      id: 1,
      title: "Beat Saber",
      description: "Beat Saber is a VR rhythm game where your goal is to slash the beats which fit perfectly into precisely handcrafted music. Every beat indicates which saber you need to use and the direction you need to match. All the music is composed to perfectly fit the handmade levels. Our goal is to make players almost dance while cutting the cubes and avoiding obstacles.",
      coverImage: "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=1600&auto=format&fit=crop",
      screenshots: [
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1626379961798-54b76fb1a8da?q=80&w=800&auto=format&fit=crop",
      ],
      categories: ["Rhythm", "Action", "Music"],
      rating: 4.9,
      duration: "5-30 min",
      players: "Single Player",
      ageRating: "E for Everyone",
      systemRequirements: {
        headset: "Oculus Quest 2 or higher",
        processor: "Intel i5-7500 / AMD Ryzen 5 1600",
        graphics: "GTX 1060 / AMD Radeon RX 580",
        memory: "8 GB RAM"
      }
    },
    2: {
      id: 2,
      title: "Half-Life: Alyx",
      description: "Half-Life: Alyx is Valve's VR return to the Half-Life series. It's the story of an impossible fight against a vicious alien race known as the Combine, set between the events of Half-Life and Half-Life 2. Playing as Alyx Vance, you are humanity's only chance for survival.",
      coverImage: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=1600&auto=format&fit=crop",
      screenshots: [
        "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1626379961798-54b76fb1a8da?q=80&w=800&auto=format&fit=crop",
      ],
      categories: ["Adventure", "Shooter", "Action"],
      rating: 4.8,
      duration: "10-15 hours",
      players: "Single Player",
      ageRating: "M for Mature",
      systemRequirements: {
        headset: "Valve Index, HTC Vive, Oculus Rift",
        processor: "Intel i5-7500 / AMD Ryzen 5 1600",
        graphics: "GTX 1060 / AMD Radeon RX 580",
        memory: "12 GB RAM"
      }
    },
    3: {
      id: 3,
      title: "Superhot VR",
      description: "SUPERHOT VR is a virtual reality first-person shooter video game. Time in the game progresses only when the player moves, allowing for a unique gameplay experience where players can plan their actions in slow-motion. The game features multiple locations and gives players access to a variety of weapons.",
      coverImage: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=1600&auto=format&fit=crop",
      screenshots: [
        "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1626379961798-54b76fb1a8da?q=80&w=800&auto=format&fit=crop",
      ],
      categories: ["Action", "Strategy", "Shooter"],
      rating: 4.7,
      duration: "2-3 hours",
      players: "Single Player",
      ageRating: "T for Teen",
      systemRequirements: {
        headset: "Oculus Quest, Valve Index, HTC Vive",
        processor: "Intel i5-4590 / AMD Ryzen 3 1200",
        graphics: "GTX 970 / AMD Radeon R9 290",
        memory: "8 GB RAM"
      }
    }
  };

  return games[id] || null;
}

export default GameDetail;
