import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, ChevronLeft, Star, Clock, Gamepad2, Sword } from "lucide-react";
const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("featured");
  const [currentFeaturedIndex, setCurrentFeaturedIndex] = useState(0);

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
    const interval = setInterval(() => {
      setCurrentFeaturedIndex(prev => (prev + 1) % featuredGames.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [featuredGames.length]);
  const handlePrevFeatured = () => {
    setCurrentFeaturedIndex(prev => prev === 0 ? featuredGames.length - 1 : prev - 1);
  };
  const handleNextFeatured = () => {
    setCurrentFeaturedIndex(prev => (prev + 1) % featuredGames.length);
  };
  return <MainLayout className="space-y-8">
      <section className="text-center mt-4">
        
        
      </section>

      {/* Featured Game Carousel */}
      <section className="relative h-[350px] md:h-[400px] overflow-hidden rounded-2xl">
        {featuredGames.map((game, index) => <div key={game.id} className={`absolute inset-0 transition-all duration-1000 ease-in-out ${index === currentFeaturedIndex ? "opacity-100 z-10" : "opacity-0 z-0"}`} style={{
        backgroundImage: `linear-gradient(to top, rgba(11, 14, 24, 0.9), rgba(11, 14, 24, 0.3)), url(${game.image})`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
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
                    <Button className="vr-button" onClick={() => navigate(`/games/${game.id}`)}>
                      Play Now
                    </Button>
                    <Button variant="outline" className="border-vr-primary/50 text-vr-text hover:bg-vr-primary/20" onClick={() => navigate(`/games/${game.id}?showTrailer=true`)}>
                      Watch Trailer
                    </Button>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-1 bg-vr-dark/50 px-3 py-1 rounded-full text-vr-secondary backdrop-blur-sm">
                  <Star className="h-4 w-4 fill-vr-secondary text-vr-secondary" />
                  <span>{game.rating}</span>
                </div>
              </div>
            </div>
          </div>)}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-vr-dark/50 hover:bg-vr-primary/60 p-2 rounded-full backdrop-blur-sm transition-colors" onClick={handlePrevFeatured}>
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-vr-dark/50 hover:bg-vr-primary/60 p-2 rounded-full backdrop-blur-sm transition-colors" onClick={handleNextFeatured}>
          <ChevronRight className="h-6 w-6 text-white" />
        </button>
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {featuredGames.map((_, index) => <button key={index} className={`h-2 w-2 rounded-full transition-colors ${index === currentFeaturedIndex ? "bg-vr-secondary" : "bg-vr-text/30"}`} onClick={() => setCurrentFeaturedIndex(index)} />)}
        </div>
      </section>

      {/* Game Categories */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {gameCategories.map(category => <div key={category.id} className="vr-card flex flex-col items-center justify-center gap-3 py-6 cursor-pointer hover:border-vr-secondary/50 transition-all group" onClick={() => navigate(`/games?category=${category.name.toLowerCase()}`)}>
            <div className="p-3 rounded-full bg-vr-dark/50 group-hover:scale-110 transition-transform">
              {category.icon}
            </div>
            <h3 className="text-lg font-medium">{category.name}</h3>
          </div>)}
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
            <GameGrid games={featuredGames} />
          </TabsContent>
          
          <TabsContent value="popular" className="m-0">
            <GameGrid games={featuredGames.slice().reverse()} />
          </TabsContent>
          
          <TabsContent value="new" className="m-0">
            <GameGrid games={featuredGames.slice().sort(() => Math.random() - 0.5)} />
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
}
const GameCard = ({
  game
}: GameCardProps) => {
  const navigate = useNavigate();
  return <div className="vr-card cursor-pointer group h-full flex flex-col" onClick={() => navigate(`/games/${game.id}`)}>
      <div className="aspect-[16/9] overflow-hidden rounded-lg mb-3 relative">
        <img src={game.image} alt={game.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-vr-dark/70 px-2 py-1 rounded-md text-xs backdrop-blur-sm">
          <Star className="h-3 w-3 fill-vr-secondary text-vr-secondary" />
          <span className="text-vr-text">{game.rating || '4.5'}</span>
        </div>
      </div>
      <h3 className="text-lg font-medium group-hover:text-vr-secondary transition-colors">
        {game.title}
      </h3>
      <span className="text-sm text-vr-muted">{game.category}</span>
    </div>;
};
interface GameGridProps {
  games: GameCardProps['game'][];
}
const GameGrid = ({
  games
}: GameGridProps) => {
  return <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {games.map(game => <GameCard key={game.id} game={game} />)}
    </div>;
};
export default Index;