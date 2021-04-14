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

export interface ApiResponse<T> {
  result: Array<T>;
}
