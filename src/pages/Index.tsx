import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import MainLayout from "@/components/layout/MainLayout";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import CommandCenterStatus from "@/components/CommandCenterStatus";

const Index = () => {
  const navigate = useNavigate();
  const [showStartScreen, setShowStartScreen] = useState(true);
  
  const handleStartExperience = () => {
    // Navigate directly to games page instead of showing the slideshow
    navigate('/games');
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

  // Redirect to Games if somehow user gets past the start screen
  useEffect(() => {
    if (!showStartScreen) {
      navigate('/games');
    }
  }, [showStartScreen, navigate]);
  
  // Return empty div for the brief moment before redirect happens
  return <div></div>;
};

export default Index;
