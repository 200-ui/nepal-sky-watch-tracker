
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { CalendarIcon, Plane, Search } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Nepali airlines data
const AIRLINES = [
  { id: "buddha", name: "Buddha Air" },
  { id: "yeti", name: "Yeti Airlines" },
  { id: "shree", name: "Shree Airlines" },
  { id: "simrik", name: "Simrik Air" },
  { id: "saurya", name: "Saurya Airlines" },
  { id: "summit", name: "Summit Air" },
  { id: "tara", name: "Tara Air" },
];

// Nepali cities data
const CITIES = [
  { id: "ktm", name: "Kathmandu" },
  { id: "pkr", name: "Pokhara" },
  { id: "bhr", name: "Bharatpur" },
  { id: "bht", name: "Biratnagar" },
  { id: "jkp", name: "Janakpur" },
  { id: "nepj", name: "Nepalgunj" },
  { id: "bwa", name: "Bhairahawa" },
  { id: "luk", name: "Lukla" },
  { id: "sim", name: "Simara" },
  { id: "tum", name: "Tumlingtar" },
];

interface FlightSearchProps {
  onSearch: (search: {
    from: string;
    to: string;
    date: Date;
    airline: string;
  }) => void;
}

const FlightSearch = ({ onSearch }: FlightSearchProps) => {
  const { toast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [airline, setAirline] = useState("");
  
  const handleSearch = () => {
    if (!from || !to || !airline) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please select origin, destination and airline",
      });
      return;
    }
    
    if (from === to) {
      toast({
        variant: "destructive",
        title: "Invalid route",
        description: "Origin and destination cannot be the same",
      });
      return;
    }
    
    onSearch({ from, to, date, airline });
  };

  return (
    <Card className="w-full animate-fade-in">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Select value={from} onValueChange={setFrom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select origin" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Select value={to} onValueChange={setTo}>
                <SelectTrigger>
                  <SelectValue placeholder="Select destination" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(date) => date && setDate(date)}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Airline</label>
              <Select value={airline} onValueChange={setAirline}>
                <SelectTrigger>
                  <SelectValue placeholder="Select airline" />
                </SelectTrigger>
                <SelectContent>
                  {AIRLINES.map((airline) => (
                    <SelectItem key={airline.id} value={airline.id}>
                      {airline.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={handleSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            Find Flights
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default FlightSearch;
