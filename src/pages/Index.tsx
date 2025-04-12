
import { useState } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import SplashScreen from "@/components/SplashScreen";
import FlightSearch from "@/components/FlightSearch";
import FlightList, { Flight } from "@/components/FlightList";
import FlightDetail from "@/components/FlightDetail";
import ModeToggle from "@/components/ModeToggle";
import { Plane } from "lucide-react";
import { searchFlights } from "@/data/flightService";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [searchCriteria, setSearchCriteria] = useState({
    from: "",
    to: "",
    date: new Date(),
    airline: ""
  });

  const handleSearch = (search: {
    from: string;
    to: string;
    date: Date;
    airline: string;
  }) => {
    setSearchCriteria(search);
    const results = searchFlights(search.from, search.to, search.date, search.airline);
    setFlights(results);
    setSelectedFlight(null);
  };

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
  };

  const handleBack = () => {
    setSelectedFlight(null);
  };

  // Render splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <ThemeProvider defaultTheme="light">
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <Plane className="h-6 w-6 mr-2 text-primary" />
              <h1 className="text-xl font-bold">Nepal Flight Tracker</h1>
            </div>
            <ModeToggle />
          </div>
        </header>

        <main className="container py-6 space-y-8">
          {selectedFlight ? (
            <FlightDetail 
              flight={selectedFlight} 
              onBack={handleBack}
            />
          ) : (
            <>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Find Flights</h2>
                <p className="text-muted-foreground">
                  Track flights between major Nepali airports
                </p>
              </div>
              
              <FlightSearch onSearch={handleSearch} />
              
              {flights.length > 0 && (
                <FlightList 
                  flights={flights} 
                  onSelectFlight={handleSelectFlight} 
                />
              )}
            </>
          )}
        </main>
        
        <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] dark:bg-black dark:bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)]">
        </div>
      </div>
    </ThemeProvider>
  );
};

export default Index;
