
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Star, 
  Clock, 
  Users,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useGames } from "@/hooks/useGames";
import { useUserRoles } from "@/hooks/useUserRoles";
import { toast } from "@/components/ui/use-toast";

const GameDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { games, isLoading } = useGames();
  const { userVenues, isLoading: rolesLoading } = useUserRoles();
  
  const game = games?.find(g => g.id === id);

  const handlePlayGame = () => {
    if (!game) return;

    // Check if user has venue assigned
    if (!userVenues || userVenues.length === 0) {
      toast({
        variant: "destructive",
        title: "Venue Required",
        description: "You need to have a venue assigned to launch games. Please contact support or complete your setup.",
      });
      
      // Redirect to admin/setup instead of launch options
      navigate('/admin');
      return;
    }

    // If venue is available, proceed to launch options
    const params = new URLSearchParams({
      gameId: game.id,
      title: game.title,
    });
    navigate(`/launch-options?${params.toString()}`);
  };

  if (isLoading || rolesLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-vr-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!game) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-vr-muted mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-vr-text mb-2">Game Not Found</h2>
          <p className="text-vr-muted mb-6">The game you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/games')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Games
          </Button>
        </div>
      </MainLayout>
    );
  }

  const category = game.description?.split(",")[0] || "VR Experience";
  const hasTrailer = !!game.trailer_url;
  const imageUrl = game.image_url || "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop";

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/games')}
            className="text-vr-text hover:text-vr-primary"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Games
          </Button>
        </div>

        {/* Game Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Game Image */}
          <div className="space-y-4">
            <div className="aspect-[16/9] overflow-hidden rounded-lg relative">
              <img 
                src={imageUrl}
                alt={game.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1559363367-ee2b206e73ea?q=80&w=800&auto=format&fit=crop";
                }}
              />
              {hasTrailer && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <Button
                    size="lg"
                    className="bg-white/90 text-black hover:bg-white"
                  >
                    <Play className="h-6 w-6 mr-2" />
                    Watch Trailer
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Game Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Badge variant="secondary" className="bg-vr-primary/20 text-vr-primary">
                  {category}
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-vr-secondary text-vr-secondary" />
                  <span className="text-vr-text">4.5</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-vr-text mb-4">{game.title}</h1>
              <p className="text-vr-muted text-lg leading-relaxed">
                {game.description || "Experience cutting-edge virtual reality gaming with stunning visuals and immersive gameplay."}
              </p>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-vr-dark/50 border-vr-primary/30">
                <CardContent className="p-4 text-center">
                  <Clock className="h-6 w-6 text-vr-primary mx-auto mb-2" />
                  <div className="text-sm text-vr-muted">Duration</div>
                  <div className="text-lg font-semibold text-vr-text">5-15 min</div>
                </CardContent>
              </Card>
              <Card className="bg-vr-dark/50 border-vr-primary/30">
                <CardContent className="p-4 text-center">
                  <Users className="h-6 w-6 text-vr-secondary mx-auto mb-2" />
                  <div className="text-sm text-vr-muted">Players</div>
                  <div className="text-lg font-semibold text-vr-text">1 Player</div>
                </CardContent>
              </Card>
            </div>

            {/* Venue Status Warning */}
            {(!userVenues || userVenues.length === 0) && (
              <Card className="bg-orange-500/10 border-orange-500/30">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                    <div>
                      <div className="font-medium text-orange-200">Setup Required</div>
                      <div className="text-sm text-orange-300">
                        Complete your venue setup to launch games
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Launch Button */}
            <Button
              onClick={handlePlayGame}
              size="lg"
              className="w-full h-14 text-lg bg-gradient-to-r from-vr-primary to-vr-secondary hover:from-vr-primary/90 hover:to-vr-secondary/90 text-black font-semibold"
            >
              <Play className="h-6 w-6 mr-3" />
              {(!userVenues || userVenues.length === 0) ? 'Complete Setup' : 'Launch Game'}
            </Button>
          </div>
        </div>

        {/* Additional Game Info */}
        <Card className="bg-vr-dark/30 border-vr-primary/20">
          <CardHeader>
            <CardTitle className="text-vr-text">About This Game</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-vr-muted">
              Immerse yourself in this cutting-edge VR experience featuring state-of-the-art graphics, 
              intuitive controls, and engaging gameplay that will transport you to another world. 
              Perfect for players of all skill levels.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default GameDetail;
