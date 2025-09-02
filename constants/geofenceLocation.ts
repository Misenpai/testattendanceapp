// constants/geofenceLocation.ts
import { GeofenceLocation } from "@/types/geofence";

export const IIT_GUWAHATI_LOCATION: GeofenceLocation = {
  id: "iit-guwahati",
  label: "IIT Guwahati",
  center: {
    lat: 26.1923, // 26°11'10.8"N
    lng: 91.6951, // 91°44'43.2"E
  },
  radius: 1200, // meters for campus
};

export const BUILDINGS: GeofenceLocation[] = [
  {
    id: "B1",
    label: "Building B1",
    center: {
      lat: 26.185065,
      lng: 91.689309,
    },
    radius: 200,
  },
  {
    id: "B2",
    label: "Building B2",
    center: {
      lat: 26.186839,
      lng: 91.689056,
    },
    radius: 200,
  },
  {
    id: "B3",
    label: "Building B3",
    center: {
      lat: 26.185434,
      lng: 91.690839,
    },
    radius: 200,
  },
];

export const DEPT_TO_BUILDING: { [key: string]: string } = {
  Dept1: "B1",
  Dept2: "B1",
  Dept3: "B2",
  Dept4: "B2",
  Dept5: "B3",
};