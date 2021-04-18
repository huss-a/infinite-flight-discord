export interface FlightInfo {
  username: string;
  callsign: string;
  latitude: number;
  longitude: number;
  altitude: number;
  speed: number;
  verticalSpeed: number;
  track: number;
  lastReport: Date;
  flightId: string;
  userId: string;
  aircraftId: string;
  liveryId: string;
  heading: number;
  virtualOrganization: string | null;
}

export interface AtcFreqs {
  frequencyId: string;
  userId: string;
  username: string;
  virtualOrganization: string | null;
  airportName: string;
  type: number;
  latitude: number;
  longitude: number;
  startTime: Date;
}

export enum AtcFreqType {
  Ground,
  Tower,
  Unicom,
  Clearance,
  Approach,
  Departure,
  Center,
  ATIS,
  Aircraft,
  Recorded,
  Unknown,
  Unused,
}

export enum AtcRank {
  "Observer",
  "ATC Trainee",
  "ATC Apprentice",
  "ATC Specialist",
  "ATC Officer",
  "ATC Supervisor",
  "ATC Recruiter",
  "ATC Manager",
  "Unknown"
}

export interface UserStats {
  onlineFlights: number;
  violations: number;
  xp: number;
  landingCount: number;
  flightTime: number;
  atcOperations: number;
  atcRank: AtcRank;
  grade: number;
  hash: string;
  violationCountByLevel: {
    level1: number;
    level2: number;
    level3: number;
  };
  roles: [];
  userId: string;
  virtualOrganization: string;
  discourseUsername: string;
  groups: [];
  errorCode: number;
}
export interface ApiResponseArr<T> {
  result: T[];
}