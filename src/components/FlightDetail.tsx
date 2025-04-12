
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Bell,
  BellOff,
  ArrowLeft,
  Plane,
  Clock,
  Calendar,
  ArrowRight,
  AlertTriangle
} from "lucide-react";
import { format, formatDistance } from "date-fns";
import { Flight } from "./FlightList";
import { cn } from "@/lib/utils";

interface FlightDetailProps {
  flight: Flight;
  onBack: () => void;
}

const FlightDetail = ({ flight, onBack }: FlightDetailProps) => {
  const { toast } = useToast();
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [audio] = useState(new Audio("/announcement.mp3"));

  useEffect(() => {
    // Handle animation and sound
    const timer = setTimeout(() => {
      try {
        audio.volume = 0.5;
        audio.play().catch(() => {
          console.log("Audio play prevented by browser. User interaction needed.");
        });
      } catch (error) {
        console.error("Audio playback error:", error);
      }

      let targetProgress = 0;
      
      if (flight.status === "departed") {
        // Calculate progress based on time since departure
        const now = new Date();
        const departureTime = flight.actualDeparture || flight.scheduledDeparture;
        const arrivalTime = flight.scheduledArrival;
        const totalDuration = arrivalTime.getTime() - departureTime.getTime();
        const elapsed = now.getTime() - departureTime.getTime();
        targetProgress = Math.min(Math.max(Math.floor((elapsed / totalDuration) * 100), 0), 100);
      } else if (flight.status === "landed") {
        targetProgress = 100;
      }
      
      setProgress(targetProgress);
    }, 500);
    
    return () => {
      clearTimeout(timer);
      audio.pause();
    };
  }, [flight, audio]);

  const enableNotifications = () => {
    setNotificationsEnabled(true);
    setNotificationDialog(false);
    
    toast({
      title: "Notifications enabled",
      description: `You'll receive updates for flight ${flight.flightNumber}`,
    });
  };

  // Calculate arrival/departure times
  const getDepartureInfo = () => {
    if (flight.status === "scheduled") {
      return {
        title: "Scheduled Departure",
        time: format(flight.scheduledDeparture, "HH:mm"),
        subtitle: format(flight.scheduledDeparture, "dd MMM, yyyy"),
      };
    } else if (flight.status === "delayed") {
      return {
        title: "Delayed Departure",
        time: format(
          new Date(flight.scheduledDeparture.getTime() + flight.delayMinutes * 60000), 
          "HH:mm"
        ),
        subtitle: `Originally ${format(flight.scheduledDeparture, "HH:mm")}`,
      };
    } else {
      return {
        title: "Departed",
        time: format(flight.actualDeparture || flight.scheduledDeparture, "HH:mm"),
        subtitle: format(flight.actualDeparture || flight.scheduledDeparture, "dd MMM, yyyy"),
      };
    }
  };
  
  const getArrivalInfo = () => {
    if (flight.status === "landed") {
      return {
        title: "Landed",
        time: format(flight.actualArrival || flight.scheduledArrival, "HH:mm"),
        subtitle: format(flight.actualArrival || flight.scheduledArrival, "dd MMM, yyyy"),
      };
    } else {
      const estimatedTime = flight.status === "delayed"
        ? new Date(flight.scheduledArrival.getTime() + flight.delayMinutes * 60000)
        : flight.scheduledArrival;
        
      return {
        title: "Estimated Arrival",
        time: format(estimatedTime, "HH:mm"),
        subtitle: format(estimatedTime, "dd MMM, yyyy"),
      };
    }
  };
  
  const departureInfo = getDepartureInfo();
  const arrivalInfo = getArrivalInfo();
  
  // Calculate remaining time for in-flight
  const getRemainingTime = () => {
    if (flight.status !== "departed") return null;
    
    const now = new Date();
    const arrivalTime = flight.scheduledArrival;
    
    if (now > arrivalTime) return "Landing soon";
    
    return formatDistance(arrivalTime, now, { addSuffix: true });
  };
  
  const remainingTime = getRemainingTime();

  return (
    <div className="animate-fade-in">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={onBack}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to flights
      </Button>
      
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                Flight {flight.flightNumber}
              </CardTitle>
              <CardDescription>{flight.airline.name}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setNotificationDialog(true)}
              className={notificationsEnabled ? "text-secondary" : ""}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Flight status */}
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center mb-3">
              <div className={cn(
                "h-3 w-3 rounded-full mr-2",
                flight.status === "scheduled" ? "bg-blue-500" :
                flight.status === "delayed" ? "bg-orange-500" :
                flight.status === "departed" ? "bg-green-500 animate-pulse" :
                "bg-primary"
              )} />
              <span className="font-medium">
                {flight.status === "scheduled" ? "Scheduled" :
                 flight.status === "delayed" ? `Delayed by ${flight.delayMinutes} minutes` :
                 flight.status === "departed" ? "In Flight" :
                 "Landed"}
              </span>
            </div>
            
            {flight.status === "departed" && (
              <div className="space-y-2">
                <div className="plane-progress">
                  <div className="plane-progress-bar" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs">{flight.origin.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {remainingTime}
                  </span>
                  <span className="text-xs">{flight.destination.name}</span>
                </div>
              </div>
            )}
          </div>
          
          {/* Route info */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <h3 className="text-lg font-medium">{flight.origin.name}</h3>
              <p className="text-xs text-muted-foreground">
                {flight.origin.id}
              </p>
            </div>
            
            <div className="flex justify-center items-center">
              <div className="w-full relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Plane className="h-6 w-6 text-primary" />
                </div>
                <hr className="border-t border-muted" />
              </div>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-medium">{flight.destination.name}</h3>
              <p className="text-xs text-muted-foreground">
                {flight.destination.id}
              </p>
            </div>
          </div>
          
          {/* Departure and arrival */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {departureInfo.title}
              </h3>
              <p className="text-2xl font-bold">{departureInfo.time}</p>
              <p className="text-sm text-muted-foreground">
                {departureInfo.subtitle}
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                {arrivalInfo.title}
              </h3>
              <p className="text-2xl font-bold">{arrivalInfo.time}</p>
              <p className="text-sm text-muted-foreground">
                {arrivalInfo.subtitle}
              </p>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-muted/50 rounded-b-lg">
          <div className="w-full">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{format(flight.scheduledDeparture, "dd MMM, yyyy")}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  {formatDistance(
                    flight.scheduledArrival,
                    flight.scheduledDeparture
                  )} duration
                </span>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Notification dialog */}
      <Dialog open={notificationDialog} onOpenChange={setNotificationDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enable notifications?</DialogTitle>
            <DialogDescription>
              You'll receive updates about flight status changes, including:
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>45 minutes before departure</li>
                <li>Any schedule changes or delays</li>
                <li>When the flight departs</li>
                <li>When the flight lands</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-2 sm:space-x-0">
            <Button variant="outline" onClick={() => setNotificationDialog(false)}>
              Let it be
            </Button>
            <Button onClick={enableNotifications}>
              Yes, notify me
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlightDetail;
