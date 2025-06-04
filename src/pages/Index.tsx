import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Gamepad2, 
  Star, 
  Clock, 
  Users, 
  Shield,
  Settings,
  Building2,
  Crown
} from "lucide-react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";

const Index = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const featuredGames = [
    {
      id: 1,
      title: "Space Explorer VR",
      description: "Journey through the cosmos in this immersive space adventure",
      image: "/placeholder.svg",
      rating: 4.8,
      duration: "15-30 min",
      players: "1 player",
      category: "Adventure"
    },
    {
      id: 2,
      title: "Zombie Apocalypse",
      description: "Survive the undead horde in this thrilling survival experience",
      image: "/placeholder.svg",
      rating: 4.6,
      duration: "20-45 min",
      players: "1-2 players",
      category: "Action"
    },
    {
      id: 3,
      title: "Ocean Deep",
      description: "Explore the mysteries of the deep sea and its creatures",
      image: "/placeholder.svg",
      rating: 4.9,
      duration: "10-25 min",
      players: "1 player",
      category: "Educational"
    }
  ];

  const adminOptions = [
    {
      title: "Machine Admin",
      description: "Access admin panel for specific VR machines",
      icon: Building2,
      href: "/machine-admin",
      badge: "Product ID Required",
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Legacy Admin",
      description: "Traditional PIN-based admin access",
      icon: Settings,
      href: "/admin",
      badge: "PIN Access",
      color: "from-green-500 to-green-600"
    },
    {
      title: "Super Admin",
      description: "Complete network management and analytics",
      icon: Crown,
      href: "/super-admin",
      badge: "Full Access",
      color: "from-purple-500 to-purple-600"
    }
  ];

  return (
    <MainLayout backgroundVariant="grid" withPattern intensity="medium">
      <div className="space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <Badge variant="outline" className="px-4 py-2 text-lg">
            Next-Generation VR Experience
          </Badge>
          <h1 className="text-6xl font-bold bg-gradient-to-r from-vr-primary via-vr-secondary to-vr-accent bg-clip-text text-transparent">
            Welcome to VR World
          </h1>
          <p className="text-xl text-vr-muted max-w-3xl mx-auto leading-relaxed">
            Immerse yourself in breathtaking virtual reality experiences. From thrilling adventures 
            to educational journeys, discover worlds beyond imagination.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/games">
              <Button size="lg" className="px-8 py-4 text-lg">
                <Play className="mr-2 h-5 w-5" />
                Start Playing
              </Button>
            </Link>
            <Link to="/rfid-auth">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg">
                <Shield className="mr-2 h-5 w-5" />
                RFID Access
              </Button>
            </Link>
          </div>
        </div>

        {/* Featured Games */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Featured Experiences</h2>
            <p className="text-xl text-vr-muted">Handpicked adventures waiting for you</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredGames.map((game, index) => (
              <Card 
                key={game.id}
                className={`overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer ${
                  hoveredCard === index ? 'scale-105 shadow-xl' : ''
                }`}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <div className="aspect-video bg-gradient-to-br from-vr-primary/20 to-vr-secondary/20 relative overflow-hidden">
                  <img 
                    src={game.image} 
                    alt={game.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary">{game.category}</Badge>
                  </div>
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">{game.rating}</span>
                  </div>
                </div>
                
                <CardHeader>
                  <CardTitle className="text-xl">{game.title}</CardTitle>
                  <CardDescription className="text-base">{game.description}</CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="flex justify-between items-center text-sm text-vr-muted">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {game.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {game.players}
                    </div>
                  </div>
                  <Link to={`/game/${game.id}`}>
                    <Button className="w-full mt-4">
                      <Gamepad2 className="mr-2 h-4 w-4" />
                      Play Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Admin Access Section */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold mb-4">Administrative Access</h2>
            <p className="text-xl text-vr-muted">Manage and configure your VR systems</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {adminOptions.map((option, index) => (
              <Link key={index} to={option.href}>
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                  <CardHeader className="text-center pb-4">
                    <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center mb-4`}>
                      <option.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant="outline" className="mb-2">
                      {option.badge}
                    </Badge>
                    <CardTitle className="text-xl">{option.title}</CardTitle>
                    <CardDescription className="text-base">
                      {option.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Button variant="outline" className="w-full">
                      Access Panel
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Stats */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="text-4xl font-bold text-vr-primary">50+</div>
            <div className="text-vr-muted">VR Experiences</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-vr-secondary">10k+</div>
            <div className="text-vr-muted">Happy Customers</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-vr-accent">99.9%</div>
            <div className="text-vr-muted">Uptime</div>
          </div>
          <div className="space-y-2">
            <div className="text-4xl font-bold text-vr-primary">24/7</div>
            <div className="text-vr-muted">Support</div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
