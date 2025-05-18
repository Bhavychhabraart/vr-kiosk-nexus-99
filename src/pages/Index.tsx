
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft, Star, Clock, Gamepad2, Sword, Play } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import CommandCenterStatus from "@/components/CommandCenterStatus";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("featured");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(5); // in minutes

  // Mock featured games data
  const featuredGames = [{
    id: 1,
    title: "Beat Saber",
    category: "Rhythm & Action",
    image: "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop",
    rating: 4.9,
    description: "Slash the beats as they fly towards you, matching their rhythm!"
  }, {
    id: 2,
    title: "Half-Life: Alyx",
    category: "Adventure & Shooter",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
    rating: 4.8,
    description: "Immerse yourself in deep gameplay and environmental interactions."
  }, {
    id: 3,
    title: "Superhot VR",
    category: "Action & Strategy",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
    rating: 4.7,
    description: "Time moves only when you move in this unique action shooter."
  }];

  // Mock game categories
  const gameCategories = [{
    id: 1,
    name: "Action",
    icon: <Sword size={24} className="text-vr-accent" />
  }, {
    id: 2,
    name: "Adventure",
    icon: <Gamepad2 size={24} className="text-vr-secondary" />
  }, {
    id: 3,
    name: "Puzzle",
    icon: <Star size={24} className="text-yellow-500" />
  }, {
    id: 4,
    name: "Simulation",
    icon: <Clock size={24} className="text-vr-primary" />
  }];

  // Auto rotate featured games
  useEffect(() => {
    if (showStartScreen) return;
    
    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prev => (prev + 1) % featuredGames.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredGames.length, showStartScreen]);
  
  const handlePrevFeatured = () => {
    setCurrentFeaturedIndex(prev => prev === 0 ? featuredGames.length - 1 : prev - 1);
  };
  
  const handleNextFeatured = () => {
    setCurrentFeaturedIndex(prev => (prev + 1) % featuredGames.length);
  };

  const handleStartExperience = () => {
    setShowStartScreen(false);
  };

  const handleSelectGame = (game) => {
    setSelectedGame(game);
  };

  const handleStartSession = () => {
    if (!selectedGame) return;
    
    navigate(`/session?gameId=${selectedGame.id}&title=${selectedGame.title}`);
  };

  // If we're showing the start screen
  if (showStartScreen) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-vr-dark"
      >
        {/* Particles background */}
        <ParticlesBackground />
        
        <div className="absolute top-4 right-4">
          <CommandCenterStatus showLabel={false} />
        </div>
        
        <motion.div 
          className="text-center z-10"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gradient">
            <span className="text-vr-secondary">VR</span> Kiosk
          </h1>
          <p className="text-vr-muted text-xl md:text-2xl mb-12 max-w-md mx-auto">
            Experience virtual reality worlds with just a touch
          </p>
          
          <motion.div 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="flex justify-center"
          >
            <Button 
              onClick={handleStartExperience}
              className="w-64 h-64 rounded-full bg-vr-primary/10 backdrop-blur-md border border-vr-primary/30 flex flex-col items-center justify-center group hover:bg-vr-primary/20 animate-pulse-glow"
            >
              <Play className="h-16 w-16 text-vr-secondary group-hover:scale-110 transition-all mb-2" />
              <span className="text-2xl font-medium text-vr-text">Tap to Start</span>
            </Button>
          </motion.div>
        </motion.div>
        
        <footer className="absolute bottom-4 text-vr-muted text-sm">
          © 2025 VR Kiosk Management System | Powered by Lovable
        </footer>
      </motion.div>
    );
  }
  
  // If a game is selected, show the duration selection screen
  if (selectedGame) {
    return (
      <MainLayout className="space-y-8 pt-8">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2"
            onClick={() => setSelectedGame(null)}
          >
            <ChevronLeft />
            <span>Back to Games</span>
          </Button>
          
          <h1 className="text-2xl font-bold">Select Session Duration</h1>
        </div>
        
        <div className="max-w-2xl mx-auto w-full">
          <div className="vr-card p-8">
            <div className="flex items-center gap-5 mb-8">
              <img 
                src={selectedGame.image} 
                alt={selectedGame.title} 
                className="w-24 h-24 rounded-lg object-cover border border-vr-primary/20"
              />
              <div className="flex-1">
                <h2 className="text-xl font-bold">{selectedGame.title}</h2>
                <div className="flex items-center text-vr-muted">
                  <span className="mr-3">{selectedGame.category}</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-vr-secondary text-vr-secondary" />
                    <span>{selectedGame.rating}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-medium mb-2">Session Duration</label>
                <div className="relative h-2 bg-vr-primary/20 rounded-full mb-6">
                  {[5, 10, 15, 30].map((mins, i) => (
                    <button 
                      key={i}
                      className={cn(
                        "absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 h-6 w-6 rounded-full border-2 transition-all",
                        sessionDuration === mins 
                          ? "border-vr-secondary bg-vr-secondary" 
                          : "border-vr-primary bg-vr-dark"
                      )}
                      style={{ left: `${(mins / 30) * 100}%` }}
                      onClick={() => setSessionDuration(mins)}
                    />
                  ))}
                  <div 
                    className="absolute top-0 left-0 h-full bg-vr-secondary rounded-full"
                    style={{ width: `${(sessionDuration / 30) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-vr-muted text-sm px-2">
                  <span>5 min</span>
                  <span>10 min</span>
                  <span>15 min</span>
                  <span>30 min</span>
                </div>
              </div>
              
              <div className="flex justify-between items-baseline border-t border-vr-primary/20 pt-6">
                <div>
                  <p className="text-vr-muted">Selected Time</p>
                  <p className="text-3xl font-bold text-vr-text">{sessionDuration} minutes</p>
                </div>
                <div className="text-right">
                  <p className="text-vr-muted">Price</p>
                  <p className="text-2xl font-bold text-vr-secondary">${(sessionDuration * 0.5).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button 
                  onClick={handleStartSession}
                  className="w-full py-6 text-lg bg-vr-secondary text-vr-dark hover:bg-vr-secondary/90"
                >
                  Start Session
                </Button>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  // Main games selection screen
  return (
    <MainLayout className="space-y-8">
      <section className="text-center mt-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gradient">
            Select Your <span className="text-vr-secondary">Experience</span>
          </h1>
          <p className="text-vr-muted">
            Choose from our curated collection of immersive virtual reality games
          </p>
        </div>
      </section>

      {/* Featured Game Carousel */}
      <section className="relative h-[350px] md:h-[400px] overflow-hidden rounded-2xl">
        {featuredGames.map((game, index) => (
          <div 
            key={game.id} 
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentFeaturedIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`} 
            style={{
              backgroundImage: `linear-gradient(to top, rgba(11, 14, 24, 0.9), rgba(11, 14, 24, 0.3)), url(${game.image})`,
              backgroundSize: "cover",
              backgroundPosition: "center"
            }}
          >
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
              <div className="flex justify-between items-end">
                <div>
                  <span className="inline-block px-3 py-1 rounded-full bg-vr-primary/30 text-vr-secondary text-xs mb-3">
                    {game.category}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {game.title}
                  </h2>
                  <p className="text-vr-text/80 max-w-2xl mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button 
                      className="vr-button"
                      onClick={() => handleSelectGame(game)}
                    >
                      Select Game
                    </Button>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-1 bg-vr-dark/50 px-3 py-1 rounded-full text-vr-secondary backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-vr-secondary text-vr-secondary" />
                  <span>{game.rating}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        <button 
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-vr-dark/50 hover:bg-vr-primary/60 p-2 rounded-full backdrop-blur-sm transition-colors" 
          onClick={handlePrevFeatured}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button 
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-vr-dark/50 hover:bg-vr-primary/60 p-2 rounded-full backdrop-blur-sm transition-colors" 
          onClick={handleNextFeatured}
        >
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {featuredGames.map((_, index) => (
            <button 
              key={index} 
              className={`h-2 w-2 rounded-full transition-colors ${index === currentFeaturedIndex ? "bg-vr-secondary" : "bg-vr-text/30"}`} 
              onClick={() => setCurrentFeaturedIndex(index)} 
            />
          ))}
        </div>
      </section>

      {/* Game Categories */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gameCategories.map(category => (
          <div 
            key={category.id} 
            className="vr-card flex flex-col items-center justify-center gap-3 py-6 cursor-pointer hover:border-vr-secondary/50 transition-all group" 
            onClick={() => navigate(`/games?category=${category.name.toLowerCase()}`)}
          >
            <div className="p-3 rounded-full bg-vr-dark/50 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="text-lg font-medium">{category.name}</h3>
          </div>
        ))}
      </section>
      
      {/* Game Browser Tabs */}
      <section>
        <Tabs defaultValue="featured" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList className="bg-vr-dark border border-vr-primary/20">
              <TabsTrigger value="featured" className="data-[state=active]:bg-vr-primary">
                Featured
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-vr-primary">
                Popular
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-vr-primary">
                New Releases
              </TabsTrigger>
            </TabsList>
            <Button variant="link" className="text-vr-secondary" onClick={() => navigate("/games")}>
              View All <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <TabsContent value="featured" className="m-0">
            <GameGrid games={featuredGames} onGameSelect={handleSelectGame} />
          </TabsContent>
          
          <TabsContent value="popular" className="m-0">
            <GameGrid games={featuredGames.slice().reverse()} onGameSelect={handleSelectGame} />
          </TabsContent>
          
          <TabsContent value="new" className="m-0">
            <GameGrid games={featuredGames.slice().sort(() => Math.random() - 0.5)} onGameSelect={handleSelectGame} />
          </TabsContent>
        </Tabs>
      </section>
    </MainLayout>
  );
};

interface GameCardProps {
  game: {
    id: number;
    title: string;
    category: string;
    image: string;
    rating?: number;
  };
  onGameSelect: (game: any) => void;
}

const GameCard = ({ game, onGameSelect }: GameCardProps) => {
  return (
    <div 
      className="vr-card cursor-pointer group h-full flex flex-col" 
      onClick={() => onGameSelect(game)}
    >
      <div className="aspect-[16/9] overflow-hidden rounded-lg mb-3 relative">
        <img 
          src={game.image} 
          alt={game.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
        />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-vr-dark/70 px-2 py-1 rounded-md text-xs backdrop-blur-sm">
          <Star className="h-3 w-3 fill-vr-secondary text-vr-secondary" />
          <span className="text-vr-text">{game.rating || '4.5'}</span>
        </div>
      </div>
      <h3 className="text-lg font-medium group-hover:text-vr-secondary transition-colors">
        {game.title}
      </h3>
      <span className="text-sm text-vr-muted">{game.category}</span>
    </div>
  );
};

interface GameGridProps {
  games: GameCardProps['game'][];
  onGameSelect: (game: any) => void;
}

const GameGrid = ({ games, onGameSelect }: GameGridProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {games.map(game => (
        <GameCard key={game.id} game={game} onGameSelect={onGameSelect} />
      ))}
    </div>
  );
};

// Particle background component for the start screen
const ParticlesBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div 
          key={i}
          className="particle"
          style={{
            position: 'absolute',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            width: `${Math.random() * 4 + 1}px`,
            height: `${Math.random() * 4 + 1}px`,
            background: `rgba(0, 234, 255, ${Math.random() * 0.5 + 0.1})`,
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(0, 234, 255, 0.5)',
            animation: `float ${Math.random() * 10 + 10}s linear infinite`,
            animationDelay: `${Math.random() * 5}s`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-radial from-vr-primary/5 to-transparent" />
    </div>
  );
};

export default Index;
