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
export interface ApiResponse {
  result: Array<FlightInfo>;
}
