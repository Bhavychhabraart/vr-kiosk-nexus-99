
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Play,
  Clock,
  ChevronLeft,
  Gamepad2,
  Zap
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import useCommandCenter from "@/hooks/useCommandCenter";

interface GameDetailProps {
  game: {
    id: string;
    title: string;
    description: string;
    image_url: string;
    min_duration_seconds: number;
    max_duration_seconds: number;
  };
  onBack: () => void;
}

const GameDetail = ({ game, onBack }: GameDetailProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isConnected } = useCommandCenter();

  const handlePlayClick = () => {
    if (!isConnected) {
      toast({
        title: "System Offline",
        description: "VR system is not connected. Please contact staff.",
        variant: "destructive",
      });
      return;
    }
    
    // Navigate directly to launch options page
    const params = new URLSearchParams({
      gameId: game.id,
      title: game.title
    });
    
    navigate(`/launch-options?${params.toString()}`);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="vr-card h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          className="text-vr-muted hover:text-vr-text flex items-center gap-2"
          onClick={onBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Games
        </Button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="relative mb-6 rounded-lg overflow-hidden aspect-video">
          <img
            src={game.image_url}
            alt={game.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-vr-dark/80 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <h1 className="text-3xl font-bold text-white mb-2">{game.title}</h1>
            <div className="flex items-center gap-4 text-white/80">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{formatDuration(game.min_duration_seconds)} - {formatDuration(game.max_duration_seconds)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gamepad2 className="h-4 w-4" />
                <span>VR Experience</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-3">About This Game</h2>
            <p className="text-vr-muted leading-relaxed">{game.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-vr-primary/10 p-4 rounded-lg">
              <div className="text-vr-primary text-sm font-medium">Min Duration</div>
              <div className="text-2xl font-bold">{formatDuration(game.min_duration_seconds)}</div>
            </div>
            <div className="bg-vr-secondary/10 p-4 rounded-lg">
              <div className="text-vr-secondary text-sm font-medium">Max Duration</div>
              <div className="text-2xl font-bold">{formatDuration(game.max_duration_seconds)}</div>
            </div>
          </div>

          <div className="bg-vr-primary/5 p-4 rounded-lg border border-vr-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-vr-primary" />
              <span className="font-medium text-vr-primary">Quick Launch</span>
            </div>
            <p className="text-sm text-vr-muted">
              Choose from multiple launch options including instant tap-to-start, 
              RFID card payment, or QR code payment.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <Button
            onClick={handlePlayClick}
            disabled={!isConnected}
            className="w-full py-6 bg-vr-secondary hover:bg-vr-secondary/90 text-vr-dark font-semibold text-lg"
          >
            <Play className="h-5 w-5 mr-2" />
            {isConnected ? "Play Now" : "System Offline"}
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default GameDetail;
