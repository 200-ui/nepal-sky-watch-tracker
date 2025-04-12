
import { useEffect, useState } from "react";
import { Plane } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen = ({ onFinish }: SplashScreenProps) => {
  const [progress, setProgress] = useState(0);
  const [audio] = useState(new Audio("/takeoff-sound.mp3"));

  useEffect(() => {
    // Play takeoff sound
    try {
      audio.volume = 0.5;
      audio.play().catch(() => {
        console.log("Audio play prevented by browser. User interaction needed.");
      });
    } catch (error) {
      console.error("Audio playback error:", error);
    }

    // Animate progress
    const timer = setTimeout(() => {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => onFinish(), 500);
            return 100;
          }
          return prev + 1;
        });
      }, 30);
      
      return () => clearInterval(interval);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, [onFinish, audio]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
      <div className="w-28 h-28 mb-6 rounded-xl gradient-bg flex items-center justify-center shadow-lg">
        <h1 className="text-white text-2xl font-bold">OD</h1>
      </div>
      
      <div className="text-center space-y-2 mb-12">
        <h1 className="text-3xl font-bold">Nepal Flight Tracker</h1>
        <p className="text-muted-foreground">Your one stop flight tracker</p>
      </div>
      
      <div className="w-64 relative mb-12">
        <Progress value={progress} className="h-3" />
        <div 
          className={`absolute top-0 left-0 transform -translate-y-1/2 -translate-x-2`} 
          style={{ left: `${progress}%` }}
        >
          <Plane className="text-primary h-6 w-6 rotate-90" />
        </div>
      </div>
      
      <div className="absolute bottom-8 text-center">
        <p className="text-sm text-muted-foreground">© 2025 OD Studios</p>
      </div>
    </div>
  );
};

export default SplashScreen;
