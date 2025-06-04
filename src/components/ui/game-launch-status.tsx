
import { motion } from "framer-motion";
import { Loader2, CheckCircle, AlertCircle, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface GameLaunchStatusProps {
  isLaunching: boolean;
  gameRunning: boolean;
  gameTitle?: string;
  error?: string;
}

export const GameLaunchStatus = ({ 
  isLaunching, 
  gameRunning, 
  gameTitle, 
  error 
}: GameLaunchStatusProps) => {
  if (!isLaunching && !gameRunning && !error) {
    return null;
  }

  const getStatus = () => {
    if (error) {
      return {
        icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        title: "Launch Failed",
        description: error,
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-800"
      };
    }
    
    if (gameRunning) {
      return {
        icon: <CheckCircle className="h-6 w-6 text-green-500" />,
        title: "Game Running",
        description: `${gameTitle || "VR Game"} is now active`,
        bgColor: "bg-green-50 border-green-200",
        textColor: "text-green-800"
      };
    }
    
    if (isLaunching) {
      return {
        icon: <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />,
        title: "Starting Game",
        description: `Launching ${gameTitle || "VR Game"}...`,
        bgColor: "bg-blue-50 border-blue-200",
        textColor: "text-blue-800"
      };
    }
    
    return null;
  };

  const status = getStatus();
  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className={`${status.bgColor} border ${status.bgColor.includes('border') ? '' : 'border-gray-200'} shadow-lg max-w-sm`}>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            {status.icon}
            <div>
              <h4 className={`font-semibold ${status.textColor}`}>
                {status.title}
              </h4>
              <p className={`text-sm ${status.textColor} opacity-80`}>
                {status.description}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
