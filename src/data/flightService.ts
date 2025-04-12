
import { Flight } from "@/components/FlightList";
import { addMinutes, setHours, setMinutes } from "date-fns";

// City mapping
const CITIES = {
  ktm: { id: "ktm", name: "Kathmandu" },
  pkr: { id: "pkr", name: "Pokhara" },
  bhr: { id: "bhr", name: "Bharatpur" },
  bht: { id: "bht", name: "Biratnagar" },
  jkp: { id: "jkp", name: "Janakpur" },
  nepj: { id: "nepj", name: "Nepalgunj" },
  bwa: { id: "bwa", name: "Bhairahawa" },
  luk: { id: "luk", name: "Lukla" },
  sim: { id: "sim", name: "Simara" },
  tum: { id: "tum", name: "Tumlingtar" },
};

// Airline mapping
const AIRLINES = {
  buddha: { id: "buddha", name: "Buddha Air" },
  yeti: { id: "yeti", name: "Yeti Airlines" },
  shree: { id: "shree", name: "Shree Airlines" },
  simrik: { id: "simrik", name: "Simrik Air" },
  saurya: { id: "saurya", name: "Saurya Airlines" },
  summit: { id: "summit", name: "Summit Air" },
  tara: { id: "tara", name: "Tara Air" },
};

// Flight status options
const STATUS: Array<Flight['status']> = [
  "scheduled",
  "delayed",
  "departed",
  "landed"
];

// Generate flight duration in minutes based on origin and destination
const getFlightDuration = (origin: string, destination: string): number => {
  // Realistic flight durations in minutes
  const durations: Record<string, Record<string, number>> = {
    ktm: {
      pkr: 25,
      bhr: 20,
      bht: 45,
      jkp: 35,
      nepj: 55,
      bwa: 30,
      luk: 30,
      sim: 15,
      tum: 35
    },
    pkr: {
      ktm: 25,
      jkp: 45,
      bht: 60
    },
    bhr: {
      ktm: 20
    },
    bht: {
      ktm: 45,
      pkr: 60
    },
    jkp: {
      ktm: 35,
      pkr: 45
    },
    nepj: {
      ktm: 55
    },
    bwa: {
      ktm: 30
    },
    luk: {
      ktm: 30
    },
    sim: {
      ktm: 15
    },
    tum: {
      ktm: 35
    }
  };

  return durations[origin]?.[destination] || 
         durations[destination]?.[origin] || 
         30; // Default to 30 minutes
};

// Generate flight number based on airline
const generateFlightNumber = (airline: string): string => {
  const prefixes: Record<string, string> = {
    buddha: "BHA",
    yeti: "YTA",
    shree: "SHA",
    simrik: "SMK",
    saurya: "SAU",
    summit: "SUM",
    tara: "TAR"
  };
  
  const prefix = prefixes[airline] || "NEP";
  const number = Math.floor(100 + Math.random() * 900);
  
  return `${prefix} ${number}`;
};

// Generate random status with weighted probability
const generateStatus = (): Flight['status'] => {
  const now = new Date();
  const hour = now.getHours();
  
  // More flights are in the air during daytime
  const weights = {
    scheduled: hour < 8 ? 0.7 : hour > 18 ? 0.4 : 0.2,
    delayed: 0.1,
    departed: hour < 8 ? 0.2 : hour > 18 ? 0.3 : 0.6,
    landed: hour < 8 ? 0.0 : hour > 18 ? 0.2 : 0.1
  };
  
  const rand = Math.random();
  let cumulativeWeight = 0;
  
  for (const status of STATUS) {
    cumulativeWeight += weights[status];
    if (rand <= cumulativeWeight) return status;
  }
  
  return "scheduled";
};

// Generate realistic flight times
const generateFlightTimes = (date: Date, origin: string, destination: string, status: Flight['status']) => {
  const now = new Date();
  const flightDate = new Date(date);
  flightDate.setHours(0, 0, 0, 0);
  
  // Generate departure time between 6:00 AM and 6:00 PM
  const departureHour = 6 + Math.floor(Math.random() * 12);
  const departureMinute = Math.floor(Math.random() * 60);
  
  const scheduledDeparture = setMinutes(
    setHours(flightDate, departureHour),
    departureMinute
  );
  
  // Calculate scheduled arrival based on flight duration
  const duration = getFlightDuration(origin, destination);
  const scheduledArrival = addMinutes(scheduledDeparture, duration);
  
  // Generate delay for delayed flights (10-60 minutes)
  const delayMinutes = status === "delayed" 
    ? 10 + Math.floor(Math.random() * 50) 
    : 0;
  
  // Calculate actual times based on status
  let actualDeparture = null;
  let actualArrival = null;
  
  if (status === "departed" || status === "landed") {
    // For departed/landed flights, set actual departure
    actualDeparture = new Date(
      scheduledDeparture.getTime() + (delayMinutes * 60000)
    );
    
    if (status === "landed") {
      // For landed flights, set actual arrival
      actualArrival = addMinutes(actualDeparture, duration);
    }
  }
  
  return {
    scheduledDeparture,
    scheduledArrival,
    actualDeparture,
    actualArrival,
    delayMinutes
  };
};

// Generate a list of flights based on search criteria
export const searchFlights = (
  origin: string,
  destination: string,
  date: Date,
  airlineId: string
): Flight[] => {
  // Validate cities exist
  if (!CITIES[origin] || !CITIES[destination]) {
    return [];
  }
  
  // Number of flights to generate (2-6)
  const flightCount = 2 + Math.floor(Math.random() * 4);
  const flights: Flight[] = [];
  
  for (let i = 0; i < flightCount; i++) {
    // Generate flight status
    const status = generateStatus();
    
    // Generate times
    const times = generateFlightTimes(date, origin, destination, status);
    
    // Create flight object
    const flight: Flight = {
      id: `${airlineId}-${origin}-${destination}-${i}`,
      flightNumber: generateFlightNumber(airlineId),
      airline: AIRLINES[airlineId],
      origin: CITIES[origin],
      destination: CITIES[destination],
      status,
      ...times
    };
    
    flights.push(flight);
  }
  
  // Sort by scheduled departure time
  return flights.sort(
    (a, b) => a.scheduledDeparture.getTime() - b.scheduledDeparture.getTime()
  );
};
