
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Plane, Clock, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Flight status types
type FlightStatus = 
  | "scheduled" 
  | "delayed" 
  | "departed" 
  | "landed";

// Flight interface
export interface Flight {
  id: string;
  flightNumber: string;
  airline: {
    id: string;
    name: string;
  };
  origin: {
    id: string;
    name: string;
  };
  destination: {
    id: string;
    name: string;
  };
  scheduledDeparture: Date;
  actualDeparture: Date | null;
  scheduledArrival: Date;
  actualArrival: Date | null;
  status: FlightStatus;
  delayMinutes: number;
}

interface FlightListProps {
  flights: Flight[];
  onSelectFlight: (flight: Flight) => void;
}

const FlightList = ({ flights, onSelectFlight }: FlightListProps) => {
  if (flights.length === 0) {
    return (
      <Card className="w-full mt-6 animate-fade-in">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Plane className="h-16 w-16 text-muted mb-4" />
          <h3 className="text-xl font-medium">No flights found</h3>
          <p className="text-muted-foreground text-center mt-2">
            Try changing your search criteria
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-4 mt-6 animate-fade-in">
      <h2 className="text-xl font-semibold">Available Flights</h2>
      
      {flights.map((flight) => (
        <FlightCard 
          key={flight.id} 
          flight={flight} 
          onClick={() => onSelectFlight(flight)} 
        />
      ))}
    </div>
  );
};

// Flight card component
const FlightCard = ({ 
  flight, 
  onClick 
}: { 
  flight: Flight;
  onClick: () => void;
}) => {
  return (
    <Card 
      className="w-full hover:shadow-md cursor-pointer transition-all duration-300"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center">
              {flight.flightNumber}
              <StatusBadge status={flight.status} delayMinutes={flight.delayMinutes} />
            </CardTitle>
            <CardDescription>{flight.airline.name}</CardDescription>
          </div>
          <div className="text-right">
            <CardTitle className="text-lg">
              {format(flight.scheduledDeparture, "HH:mm")}
            </CardTitle>
            <CardDescription>
              {format(flight.scheduledDeparture, "dd MMM")}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-center">
            <p className="font-medium">{flight.origin.name}</p>
            <p className="text-sm text-muted-foreground">{flight.origin.id}</p>
          </div>
          
          <div className="flex-1 mx-4">
            <div className="relative">
              <Separator className="absolute w-full top-1/2" />
              <div className="flex justify-center">
                <ArrowRight className="z-10 bg-card p-1 h-6 w-6" />
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="font-medium">{flight.destination.name}</p>
            <p className="text-sm text-muted-foreground">{flight.destination.id}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Status badge component
const StatusBadge = ({ 
  status, 
  delayMinutes = 0 
}: { 
  status: FlightStatus;
  delayMinutes?: number;
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case "scheduled":
        return { 
          label: "On Time", 
          variant: "outline" as const
        };
      case "delayed":
        return { 
          label: `Delayed ${delayMinutes}m`, 
          variant: "destructive" as const 
        };
      case "departed":
        return { 
          label: "Departed", 
          variant: "secondary" as const 
        };
      case "landed":
        return { 
          label: "Landed", 
          variant: "default" as const 
        };
    }
  };
  
  const config = getStatusConfig();
  
  return (
    <Badge 
      variant={config.variant}
      className={cn("ml-2", 
        status === "departed" && "animate-pulse-slow"
      )}
    >
      {config.label}
    </Badge>
  );
};

export default FlightList;
