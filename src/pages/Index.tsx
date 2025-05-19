import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PremiumButton } from "@/components/ui/premium-button";
import { PremiumCard } from "@/components/ui/premium-card";
import { RatingDisplay } from "@/components/ui/rating-display";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft, Clock, Gamepad2, Sword, Play } from "lucide-react";
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
  const [hoveringButton, setHoveringButton] = useState(false);

  // Animation properties
  const buttonAnimation = useSpring({
    transform: hoveringButton ? `scale(1.05)` : `scale(1)`,
    boxShadow: hoveringButton ? '0 0 25px 5px rgba(99, 102, 241, 0.6)' : '0 0 15px 2px rgba(99, 102, 241, 0.3)',
    config: {
      tension: 300,
      friction: 10
    }
  });

  // Mock featured games data
  const featuredGames = [{
    id: 1,
    title: "Beat Saber",
    category: "Rhythm & Action",
    image: "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop",
    rating: 4.9,
    description: "Slash the beats as they fly towards you, matching their rhythm and intensity in this immersive VR experience."
  }, {
    id: 2,
    title: "Half-Life: Alyx",
    category: "Adventure & Shooter",
    image: "https://images.unsplash.com/photo-1593508512255-86ab42a8e620?q=80&w=800&auto=format&fit=crop",
    rating: 4.8,
    description: "Immerse yourself in deep gameplay and environmental interactions in this groundbreaking VR shooter set in the Half-Life universe."
  }, {
    id: 3,
    title: "Superhot VR",
    category: "Action & Strategy",
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?q=80&w=800&auto=format&fit=crop",
    rating: 4.7,
    description: "Time moves only when you move in this unique action shooter. Plan your moves carefully and execute with precision."
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
    icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-500"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
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
  const handleSelectGame = game => {
    setSelectedGame(game);
  };
  const handleStartSession = () => {
    if (!selectedGame) return;
    navigate(`/session?gameId=${selectedGame.id}&title=${selectedGame.title}`);
  };

  // If we're showing the start screen
  if (showStartScreen) {
    return <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-vr-dark">
        {/* Animated background */}
        <div className="absolute inset-0 bg-tech-pattern opacity-5" />
        <div className="absolute inset-0">
          {/* Dynamic animated background elements */}
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-r"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 150 + 50}px`,
                height: `${Math.random() * 150 + 50}px`,
                opacity: Math.random() * 0.3 + 0.05,
                backgroundImage: 
                  i % 3 === 0 
                    ? 'linear-gradient(to right, rgba(99, 102, 241, 0.4), rgba(99, 102, 241, 0.1))'
                    : i % 3 === 1
                    ? 'linear-gradient(to right, rgba(16, 185, 129, 0.3), rgba(16, 185, 129, 0.1))'
                    : 'linear-gradient(to right, rgba(236, 72, 153, 0.3), rgba(236, 72, 153, 0.1))'
              }}
              animate={{
                x: [0, Math.random() * 40 - 20],
                y: [0, Math.random() * 40 - 20],
                scale: [1, Math.random() * 0.2 + 0.9, 1],
                rotate: [0, Math.random() * 20 - 10]
              }}
              transition={{
                duration: Math.random() * 10 + 15,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
          ))}
          
          {/* Floating energy lines */}
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`line-${i}`}
              className="absolute h-px"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 200 + 100}px`,
                background: `linear-gradient(90deg, transparent, 
                  ${i % 2 === 0 ? '#6366F1' : '#10B981'}, transparent)`,
                opacity: Math.random() * 0.5 + 0.2,
                transformOrigin: 'center',
              }}
              animate={{
                rotate: [Math.random() * 360, Math.random() * 360 + 90],
                scale: [0.5, 1.5, 0.5],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: Math.random() * 20 + 20,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          ))}
          
          {/* Keep the original orbs with some modifications */}
          <motion.div 
            className="orb bg-vr-primary/30 w-96 h-96 -top-20 -left-20"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.4, 0.3]
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="orb bg-vr-secondary/20 w-80 h-80 -bottom-20 right-10"
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="orb bg-vr-accent/20 w-64 h-64 top-1/4 right-1/4"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.35, 0.2]
            }}
            transition={{
              duration: 18,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
        
        <div className="absolute top-4 right-4 z-10">
          <CommandCenterStatus showLabel={false} />
        </div>
        
        <motion.div className="text-center z-10" initial={{
        y: 20,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} transition={{
        delay: 0.2,
        type: "spring",
        stiffness: 100
      }}>
          <div className="mb-8">
            <img src="/images/vr-illustration.svg" alt="VR Headset" className="h-36 mx-auto" />
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-vr-secondary via-vr-primary to-vr-accent">NextGen Arcadia</span>
            <span className="block text-vr-text text-5xl">kiosk experience</span>
          </h1>
          
          <p className="text-vr-text text-xl md:text-2xl mb-12 max-w-xl mx-auto font-light">
            Immerse yourself in cutting-edge virtual worlds with our premium VR kiosk system
          </p>
          
          <div className="flex justify-center">
            <button onClick={handleStartExperience} className="relative overflow-hidden bg-gradient-to-r from-vr-accent via-vr-primary to-vr-secondary hover:from-vr-primary hover:to-vr-accent text-white font-medium py-4 px-10 rounded-lg transition-all duration-500 transform hover:scale-105 shadow-lg hover:shadow-xl w-64 h-16 text-xl">
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-vr-secondary via-vr-primary to-vr-accent opacity-0 hover:opacity-100 transition-opacity duration-1000 animate-pulse-glow"></span>
              <span className="relative z-10 flex items-center justify-center gap-2 text-base">
                <Play className="h-6 w-6" />
                Begin Experience
              </span>
            </button>
          </div>
          
          <motion.div className="absolute bottom-8 left-0 right-0 flex justify-center" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          delay: 1
        }}>
            <div className="flex gap-8 px-6 py-3 backdrop-blur-md bg-white/5 rounded-full border border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-vr-secondary animate-pulse"></div>
                <span className="text-vr-muted">Premium Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-vr-primary animate-pulse"></div>
                <span className="text-vr-muted">High Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-vr-accent animate-pulse"></div>
                <span className="text-vr-muted">Immersive Experience</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>;
  }

  // If a game is selected, show the duration selection screen
  if (selectedGame) {
    return <MainLayout className="space-y-8 pt-8" backgroundVariant="dots">
        <div className="flex items-center">
          <Button variant="ghost" className="mr-2" onClick={() => setSelectedGame(null)}>
            <ChevronLeft />
            <span>Back to Games</span>
          </Button>
          
          <h1 className="text-2xl font-bold tracking-tight">Select Session Duration</h1>
        </div>
        
        <div className="max-w-2xl mx-auto w-full">
          <PremiumCard className="p-8" glowEffect={true}>
            <div className="flex items-center gap-6 mb-8">
              <div className="relative rounded-lg overflow-hidden w-24 h-24 border border-vr-primary/20">
                <img src={selectedGame.image} alt={selectedGame.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-vr-dark to-transparent"></div>
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold tracking-tight">{selectedGame.title}</h2>
                <div className="flex flex-col sm:flex-row sm:items-center text-vr-muted gap-2 sm:gap-4 mt-1">
                  <span className="px-2 py-1 rounded-full bg-vr-primary/10 text-xs inline-block w-max">
                    {selectedGame.category}
                  </span>
                  <RatingDisplay rating={selectedGame.rating} size="sm" />
                </div>
              </div>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-lg font-medium mb-4">Session Duration</label>
                <div className="relative h-2 bg-vr-primary/20 rounded-full mb-8">
                  {[5, 10, 15, 30].map((mins, i) => <button key={i} className={cn("absolute top-1/2 -translate-y-1/2 transform -translate-x-1/2 h-6 w-6 rounded-full border-2 transition-all", sessionDuration === mins ? "border-vr-secondary bg-vr-secondary" : "border-vr-primary bg-vr-dark")} style={{
                  left: `${mins / 30 * 100}%`
                }} onClick={() => setSessionDuration(mins)} />)}
                  <div className="absolute top-0 left-0 h-full bg-vr-secondary rounded-full" style={{
                  width: `${sessionDuration / 30 * 100}%`
                }} />
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
                  <p className="text-3xl font-bold text-vr-text mt-1">{sessionDuration} minutes</p>
                </div>
                <div className="text-right">
                  <p className="text-vr-muted">Price</p>
                  <p className="text-2xl font-bold text-vr-secondary mt-1">${(sessionDuration * 0.5).toFixed(2)}</p>
                </div>
              </div>
              
              <div className="pt-4">
                <PremiumButton onClick={handleStartSession} glowEffect={true} variant="secondary" className="w-full py-6 text-lg font-semibold">
                  Start Session
                </PremiumButton>
              </div>
            </div>
          </PremiumCard>
        </div>
      </MainLayout>;
  }

  // Main games selection screen
  return <MainLayout className="space-y-12" withPattern={true}>
      <section className="text-center mt-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-vr-text via-vr-secondary to-vr-text">
              Select Your Premium Experience
            </span>
          </h1>
          <p className="text-vr-muted text-lg md:text-xl max-w-2xl mx-auto">
            Choose from our curated collection of immersive virtual reality experiences
          </p>
        </div>
      </section>

      {/* Featured Game Carousel */}
      <section className="relative h-[400px] md:h-[500px] overflow-hidden rounded-2xl perspective-container">
        {featuredGames.map((game, index) => <div key={game.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out perspective-card ${index === currentFeaturedIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`} style={{
        backgroundImage: `linear-gradient(to top, rgba(10, 12, 23, 0.9), rgba(10, 12, 23, 0.3)), url(${game.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
              <div className="max-w-3xl">
                <span className="inline-block px-3 py-1 rounded-full bg-vr-primary/30 backdrop-blur-sm text-vr-secondary text-xs mb-4 border border-vr-primary/20">
                  {game.category}
                </span>
                
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 tracking-tight">
                  {game.title}
                </h2>
                
                <p className="text-vr-text/80 max-w-2xl mb-6 text-lg">
                  {game.description}
                </p>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <PremiumButton variant="primary" className="px-6 py-2.5" glowEffect={true} onClick={() => handleSelectGame(game)}>
                    Select Experience
                    <ChevronRight size={16} />
                  </PremiumButton>
                  
                  <RatingDisplay rating={game.rating} size="lg" />
                </div>
              </div>
            </div>
          </div>)}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-vr-dark/40 hover:bg-vr-primary/60 p-3 rounded-full backdrop-blur-md transition-colors border border-white/10" onClick={handlePrevFeatured}>
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-vr-dark/40 hover:bg-vr-primary/60 p-3 rounded-full backdrop-blur-md transition-colors border border-white/10" onClick={handleNextFeatured}>
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {featuredGames.map((_, index) => <button key={index} className={`h-2 w-12 rounded-full transition-colors ${index === currentFeaturedIndex ? "bg-vr-secondary" : "bg-vr-text/30"}`} onClick={() => setCurrentFeaturedIndex(index)} />)}
        </div>
      </section>

      {/* Game Categories */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {gameCategories.map(category => <PremiumCard key={category.id} className="flex flex-col items-center justify-center gap-3 py-8 cursor-pointer hover:border-vr-secondary/50 transition-all group" variant={category.id % 2 === 0 ? "secondary" : "primary"} onClick={() => navigate(`/games?category=${category.name.toLowerCase()}`)}>
            <div className="p-4 rounded-full bg-vr-dark/50 glass-card group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="text-lg font-semibold">{category.name}</h3>
          </PremiumCard>)}
      </section>
      
      {/* Game Browser Tabs */}
      <section>
        <Tabs defaultValue="featured" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList className="bg-vr-dark border border-vr-primary/20 p-1">
              <TabsTrigger value="featured" className="data-[state=active]:bg-vr-primary data-[state=active]:text-white px-6">
                Featured
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-vr-primary data-[state=active]:text-white px-6">
                Popular
              </TabsTrigger>
              <TabsTrigger value="new" className="data-[state=active]:bg-vr-primary data-[state=active]:text-white px-6">
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
    </MainLayout>;
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
const GameCard = ({
  game,
  onGameSelect
}: GameCardProps) => {
  return <div className="glass-card cursor-pointer group h-full flex flex-col overflow-hidden border border-vr-primary/10 rounded-xl transition-all duration-300 hover:shadow-glow hover:-translate-y-1" onClick={() => onGameSelect(game)}>
      <div className="aspect-[16/9] overflow-hidden rounded-t-lg mb-0 relative shine-effect">
        <img src={game.image} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-vr-dark to-transparent"></div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-vr-dark/70 px-2 py-1 rounded-md text-xs backdrop-blur-sm">
          <RatingDisplay rating={game.rating || 4.5} size="sm" />
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold group-hover:text-vr-secondary transition-colors">
          {game.title}
        </h3>
        <span className="text-sm text-vr-muted px-2 py-0.5 rounded-full bg-vr-primary/10 inline-block mt-1">
          {game.category}
        </span>
      </div>
    </div>;
};
interface GameGridProps {
  games: GameCardProps['game'][];
  onGameSelect: (game: any) => void;
}
const GameGrid = ({
  games,
  onGameSelect
}: GameGridProps) => {
  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {games.map(game => <GameCard key={game.id} game={game} onGameSelect={onGameSelect} />)}
    </div>;
};
export default Index;
