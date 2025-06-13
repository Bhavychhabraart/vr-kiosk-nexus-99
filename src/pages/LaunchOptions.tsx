import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  CreditCard, 
  Smartphone, 
  Clock,
  GamepadIcon,
  ArrowLeft,
  Zap
} from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { useLaunchOptions } from "@/hooks/useLaunchOptions";
import { useGames } from "@/hooks/useGames";
import { useUserRoles } from "@/hooks/useUserRoles";
import useCommandCenter from "@/hooks/useCommandCenter";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { EnhancedRFIDInput } from "@/components/ui/enhanced-rfid-input";

const LaunchOptions = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { games } = useGames();
  const { userVenues } = useUserRoles();
  
  // Get parameters from URL search params
  const gameId = searchParams.get("gameId");
  const gameTitle = searchParams.get("title") || "VR Game";
  
  // Get venue ID from user's assigned venues
  const venueId = userVenues && userVenues.length > 0 ? userVenues[0].id : null;
  
  console.log('LaunchOptions - gameId:', gameId, 'venueId:', venueId, 'userVenues:', userVenues);
  
  const { launchOptions, isLoading, error } = useLaunchOptions(venueId);
  const { startSession } = useSessionTracking();
  const { launchGame, isLaunching } = useCommandCenter();
  
  // Find the game data
  const gameData = games?.find(game => game.id === gameId);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRfidInput, setShowRfidInput] = useState(false);

  useEffect(() => {
    if (!gameId) {
      console.error('No gameId provided in URL parameters');
      toast({
        variant: "destructive",
        title: "Game Not Found",
        description: "No game specified. Redirecting to games page...",
      });
      setTimeout(() => navigate('/games'), 2000);
      return;
    }

    if (gameId && !gameData && games && games.length > 0) {
      console.error('Game not found - gameId:', gameId, 'available games:', games.length);
      toast({
        variant: "destructive",
        title: "Game Not Found",
        description: "The selected game could not be found. Redirecting to games page...",
      });
      setTimeout(() => navigate('/games'), 2000);
    }
  }, [gameId, gameData, games, navigate]);

  useEffect(() => {
    if (error) {
      console.error('Launch options error:', error);
      toast({
        variant: "destructive",
        title: "Configuration Error",
        description: `Failed to load launch options: ${error.message}`,
      });
    }
  }, [error]);

  // Check if venue ID is available
  useEffect(() => {
    if (!venueId && userVenues !== undefined) {
      console.error('No venue ID available for user');
      toast({
        variant: "destructive",
        title: "Venue Error",
        description: "No venue assigned to your account. Please contact support.",
      });
    }
  }, [venueId, userVenues]);

  const calculatePrice = () => {
    if (!launchOptions) return 0;
    return launchOptions.default_duration_minutes * launchOptions.price_per_minute;
  };

  const handleLaunchOption = async (option: 'tap' | 'rfid' | 'qr') => {
    if (!gameData || !launchOptions || isProcessing || isLaunching || !venueId) {
      if (!venueId) {
        toast({
          variant: "destructive",
          title: "Venue Error",
          description: "No venue information available",
        });
      }
      return;
    }

    if (option === 'rfid') {
      setShowRfidInput(true);
      return;
    }

    setIsProcessing(true);
    
    try {
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const durationSeconds = launchOptions.default_duration_minutes * 60;
      const amount = calculatePrice();
      
      let paymentData;
      
      if (option === 'tap') {
        // Instant launch with free play
        paymentData = {
          method: 'free' as const,
          amount: 0,
          venueId,
        };
      } else if (option === 'qr') {
        // Navigate to QR payment
        const params = new URLSearchParams({
          gameId: gameData.id,
          title: gameData.title,
          duration: durationSeconds.toString(),
          sessionId,
          amount: amount.toString(),
          method: 'upi',
          venueId,
        });
        navigate(`/payment-selection?${params.toString()}`);
        return;
      }

      // For tap to start, launch immediately
      await launchGame(gameData.id, durationSeconds, paymentData);
      
      // Navigate to session page
      const sessionParams = new URLSearchParams({
        gameId: gameData.id,
        title: gameData.title,
        duration: durationSeconds.toString(),
        sessionId,
        venueId,
      });
      navigate(`/session?${sessionParams.toString()}`);
      
    } catch (error) {
      console.error('Failed to launch game:', error);
      toast({
        variant: "destructive",
        title: "Launch Failed",
        description: "Failed to start the game. Please try again.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRfidScanned = async (rfidTag: string) => {
    if (!gameData || !launchOptions || isProcessing || isLaunching || !venueId) return;

    setIsProcessing(true);
    
    try {
      console.log('RFID card scanned:', rfidTag);
      
      const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const durationSeconds = launchOptions.default_duration_minutes * 60;
      const amount = calculatePrice();
      
      const paymentData = {
        method: 'rfid' as const,
        amount: amount,
        rfidTag: rfidTag,
        venueId: venueId
      };

      // Launch game immediately
      await launchGame(gameData.id, durationSeconds, paymentData);
      
      toast({
        title: "RFID Card Accepted",
        description: `Card ${rfidTag.substring(0, 8)}... validated successfully`,
      });
      
      // Navigate to session page
      const sessionParams = new URLSearchParams({
        gameId: gameData.id,
        title: gameData.title,
        duration: durationSeconds.toString(),
        sessionId,
        rfidTag: rfidTag,
        venueId,
      });
      navigate(`/session?${sessionParams.toString()}`);
      
    } catch (error) {
      console.error('Failed to launch game with RFID:', error);
      toast({
        variant: "destructive",
        title: "RFID Launch Failed",
        description: "Failed to validate RFID card or start the game. Please try again.",
      });
      setShowRfidInput(false);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || !gameData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/80 border-vr-primary/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-vr-primary mx-auto"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !launchOptions || !venueId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-black/80 border-red-500/30">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white">Configuration Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">
              {error ? error.message : !venueId ? "No venue assigned to your account" : "Launch options not available"}
            </p>
            <Button onClick={() => navigate('/games')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Games
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/games')}
            className="text-white hover:text-vr-primary"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Games
          </Button>
        </div>

        {/* Game Info */}
        <Card className="bg-black/80 border-vr-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <GamepadIcon className="h-8 w-8 text-vr-primary" />
                <div>
                  <CardTitle className="text-2xl text-white">{gameData.title}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-gray-300">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{launchOptions.default_duration_minutes} minutes</span>
                    </div>
                    <Badge variant="secondary">
                      ₹{calculatePrice()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Launch Options */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Choose How to Play</h2>
          <p className="text-gray-300">Select your preferred launch option</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tap to Start */}
          {launchOptions.tap_to_start_enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-vr-primary/20 to-vr-primary/10 border-vr-primary/50 hover:border-vr-primary transition-all cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-vr-primary/20 rounded-full flex items-center justify-center mb-4">
                    <Zap className="h-8 w-8 text-vr-primary" />
                  </div>
                  <CardTitle className="text-xl text-white">Tap to Start</CardTitle>
                  <p className="text-gray-300 text-sm">Instant game launch</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <div className="text-2xl font-bold text-vr-primary">FREE</div>
                    <p className="text-sm text-gray-400">Quick demo session</p>
                    <Button
                      onClick={() => handleLaunchOption('tap')}
                      disabled={isProcessing || isLaunching}
                      className="w-full bg-vr-primary hover:bg-vr-primary/90 text-black font-semibold"
                    >
                      {isProcessing ? "Starting..." : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Start Now
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* RFID Card */}
          {launchOptions.rfid_enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-vr-secondary/20 to-vr-secondary/10 border-vr-secondary/50 hover:border-vr-secondary transition-all cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-vr-secondary/20 rounded-full flex items-center justify-center mb-4">
                    <CreditCard className="h-8 w-8 text-vr-secondary" />
                  </div>
                  <CardTitle className="text-xl text-white">RFID Card</CardTitle>
                  <p className="text-gray-300 text-sm">Tap your card to pay</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <div className="text-2xl font-bold text-vr-secondary">₹{calculatePrice()}</div>
                    <p className="text-sm text-gray-400">{launchOptions.default_duration_minutes} minutes gameplay</p>
                    
                    {!showRfidInput ? (
                      <Button
                        onClick={() => handleLaunchOption('rfid')}
                        disabled={isProcessing || isLaunching}
                        className="w-full bg-vr-secondary hover:bg-vr-secondary/90 text-black font-semibold"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Use RFID Card
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <EnhancedRFIDInput
                          onCardScanned={handleRfidScanned}
                          isLoading={isProcessing}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowRfidInput(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* QR Payment */}
          {launchOptions.qr_payment_enabled && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-green-500/20 to-green-600/10 border-green-500/50 hover:border-green-500 transition-all cursor-pointer h-full">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                    <Smartphone className="h-8 w-8 text-green-500" />
                  </div>
                  <CardTitle className="text-xl text-white">QR Payment</CardTitle>
                  <p className="text-gray-300 text-sm">Pay with UPI</p>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="space-y-4">
                    <div className="text-2xl font-bold text-green-500">₹{calculatePrice()}</div>
                    <p className="text-sm text-gray-400">{launchOptions.default_duration_minutes} minutes gameplay</p>
                    <Button
                      onClick={() => handleLaunchOption('qr')}
                      disabled={isProcessing || isLaunching}
                      className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
                    >
                      {isProcessing ? "Processing..." : (
                        <>
                          <Smartphone className="h-4 w-4 mr-2" />
                          Pay with QR
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Game Description */}
        <Card className="bg-black/60 border-gray-600">
          <CardContent className="pt-6">
            <p className="text-gray-300 text-center">{gameData.description}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LaunchOptions;
