// hooks/useGeofence.ts
import {
  BUILDINGS,
  DEPT_TO_BUILDING,
  IIT_GUWAHATI_LOCATION,
} from "@/constants/geofenceLocation";
import { useAttendanceStore } from "@/store/attendanceStore";
import { LatLng, MapLayer, MapMarker, MapShape } from "@/types/geofence";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { MapShapeType } from "react-native-leaflet-view";

// Add this interface for the attendance service
interface AttendanceCoordinates {
  latitude: number;
  longitude: number;
  location?: string | null;
  timestamp: Date;
}

// Add this type for the callback
type AttendanceUpdateCallback = (coordinates: AttendanceCoordinates) => void;

// Update the useGeofence hook to handle field trips properly
export function useGeofence(
  userLocationType?: "CAMPUS" | "FIELDTRIP" | null,
  isFieldTrip?: boolean,
  onLocationUpdate?: AttendanceUpdateCallback,
) {
  const [html, setHtml] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<LatLng | null>(null);
  const [initialPos, setInitialPos] = useState<LatLng | null>(null);
  const [currentLocation, setCurrentLocation] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const department = useAttendanceStore((state) => state.department);

  // Update active geofence locations logic
  const activeGeofenceLocations = useMemo(() => {
    if (userLocationType === "FIELDTRIP") {
      // For field trips, return empty array but still track location
      return [];
    }

    // CAMPUS type - IIT + user's building
    if (!department) {
      return [IIT_GUWAHATI_LOCATION];
    }

    const buildingId = DEPT_TO_BUILDING[department];
    const building = BUILDINGS.find((b) => b.id === buildingId);

    if (!building) {
      return [IIT_GUWAHATI_LOCATION];
    }

    return [IIT_GUWAHATI_LOCATION, building];
  }, [department, userLocationType]);

  const haversine = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371e3;
      const toRad = (deg: number) => (deg * Math.PI) / 180;
      const φ1 = toRad(lat1);
      const φ2 = toRad(lat2);
      const Δφ = toRad(lat2 - lat1);
      const Δλ = toRad(lon2 - lon1);
      const a =
        Math.sin(Δφ / 2) ** 2 +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    [],
  );

  const checkGeofences = useCallback(
    (position: LatLng) => {
      if (userLocationType === "FIELDTRIP") {
        return "Outside IIT (Field Trip)";
      }

      if (activeGeofenceLocations.length < 2) {
        return null;
      }

      const iit = activeGeofenceLocations[0];
      const building = activeGeofenceLocations[1];

      const distToIIT = haversine(
        position.lat,
        position.lng,
        iit.center.lat,
        iit.center.lng,
      );

      const distToBuilding = haversine(
        position.lat,
        position.lng,
        building.center.lat,
        building.center.lng,
      );

      if (distToIIT <= iit.radius && distToBuilding <= building.radius) {
        return building.label;
      }

      return null;
    },
    [haversine, activeGeofenceLocations, userLocationType],
  );

  // Add function to send coordinates to attendance service
  const updateAttendanceLocation = useCallback(
    (position: LatLng, detectedLocation: string | null) => {
      if (onLocationUpdate) {
        const coordinates: AttendanceCoordinates = {
          latitude: position.lat,
          longitude: position.lng,
          location: detectedLocation,
          timestamp: new Date(),
        };
        onLocationUpdate(coordinates);
      }
    },
    [onLocationUpdate],
  );

  // Add method to manually capture current position for attendance
  const captureLocationForAttendance = useCallback(async (): Promise<AttendanceCoordinates | null> => {
    try {
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High, // Use high accuracy for attendance
      });

      const position: LatLng = {
        lat: coords.latitude,
        lng: coords.longitude,
      };

      const detectedLocation = checkGeofences(position);
      
      const coordinates: AttendanceCoordinates = {
        latitude: position.lat,
        longitude: position.lng,
        location: detectedLocation,
        timestamp: new Date(),
      };

      // Also call the callback if provided
      if (onLocationUpdate) {
        onLocationUpdate(coordinates);
      }

      return coordinates;
    } catch (error) {
      Alert.alert("Location Error", "Failed to capture location for attendance");
      return null;
    }
  }, [checkGeofences, onLocationUpdate]);

  const mapShapes = useMemo(
    (): MapShape[] =>
      activeGeofenceLocations.map((geofence, index) => ({
        shapeType: MapShapeType.CIRCLE,
        color: index === 0 ? "#00a8ff" : "#f00", // IIT blue, building red
        id: geofence.id,
        center: geofence.center,
        radius: geofence.radius,
      })),
    [activeGeofenceLocations],
  );

  const mapLayers = useMemo(
    (): MapLayer[] => [
      {
        baseLayerName: "OpenStreetMap",
        baseLayerIsChecked: true,
        baseLayer: true,
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright ">OSM</a>',
      },
    ],
    [],
  );

  const staticLabelMarkers = useMemo(
    (): MapMarker[] =>
      activeGeofenceLocations.map((g, idx) => {
        const offsetLat = g.center.lat + 0.00015 * (idx + 1); // Slight offset for labels
        const offsetLng = g.center.lng;

        return {
          id: g.id + "_label",
          position: { lat: offsetLat, lng: offsetLng },
          icon: `
            <div style="
              position: relative;
              background: ${idx === 0 ? "#00a8ff" : "#f00"};
              border: 2px solid #fff;
              border-radius: 8px;
              padding: 6px 10px;
              font-size: 12px;
              font-weight: bold;
              color: #fff;
              white-space: nowrap;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              min-width: 80px;
              text-align: center;
            ">
              ${g.label}
              <div style="
                position: absolute;
                left: 50%;
                bottom: -8px;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 8px solid transparent;
                border-right: 8px solid transparent;
                border-top: 8px solid ${idx === 0 ? "#00a8ff" : "#f00"};
              "></div>
            </div>
          `,
          size: [100, 35],
          anchor: [50, 35],
        };
      }),
    [activeGeofenceLocations],
  );

  const mapMarkers = useMemo((): MapMarker[] => {
    const markers = [...staticLabelMarkers];

    if (userPos) {
      markers.push({
        id: "myPosition",
        position: userPos,
        icon: `
          <div style="
            position: relative;
            width: 10px;
            height: 10px;
            background: #ff0000;
            border: 3px solid #fff;
            border-radius: 50%;
            box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          ">
          </div>
        `,
        size: [26, 26],
        anchor: [13, 13],
      });
    }

    return markers;
  }, [userPos, staticLabelMarkers]);

  const mapCenter = useMemo((): LatLng | null => {
    if (activeGeofenceLocations.length === 0) {
      return initialPos;
    }

    if (activeGeofenceLocations.length === 1) {
      return activeGeofenceLocations[0].center;
    }

    const totalLat = activeGeofenceLocations.reduce(
      (sum, loc) => sum + loc.center.lat,
      0,
    );
    const totalLng = activeGeofenceLocations.reduce(
      (sum, loc) => sum + loc.center.lng,
      0,
    );

    return {
      lat: totalLat / activeGeofenceLocations.length,
      lng: totalLng / activeGeofenceLocations.length,
    };
  }, [activeGeofenceLocations, initialPos]);

  useEffect(() => {
    const initializeHtml = async () => {
      try {
        const asset = Asset.fromModule(require("../assets/leaflet.html"));
        await asset.downloadAsync();
        const htmlContent = await FileSystem.readAsStringAsync(asset.localUri!);
        setHtml(htmlContent);
      } catch (e) {
        Alert.alert("HTML Load Error", (e as Error).message);
      }
    };

    initializeHtml();
  }, []);

  useEffect(() => {
    let subscription: Location.LocationSubscription | undefined;
    let isComponentMounted = true;

    const initializeLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission denied", "Location permission is required.");
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const initialPosition = { lat: coords.latitude, lng: coords.longitude };

        if (isComponentMounted) {
          setUserPos(initialPosition);
          setInitialPos(initialPosition);
          const detectedLocation = checkGeofences(initialPosition);
          setCurrentLocation(detectedLocation);
          setIsInitialized(true);
          
          // Send initial position to attendance service
          updateAttendanceLocation(initialPosition, detectedLocation);
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 3000,
            distanceInterval: 2,
          },
          ({ coords }) => {
            if (!isComponentMounted) return;

            const newPos: LatLng = {
              lat: coords.latitude,
              lng: coords.longitude,
            };

            const detectedLocation = checkGeofences(newPos);
            setUserPos(newPos);
            setCurrentLocation(detectedLocation);
            
            // Send updated position to attendance service
            updateAttendanceLocation(newPos, detectedLocation);
          },
        );
      } catch (e) {
        if (isComponentMounted) {
          Alert.alert("Location Error", (e as Error).message);
        }
      }
    };

    initializeLocation();

    return () => {
      isComponentMounted = false;
      subscription?.remove();
    };
  }, [checkGeofences, updateAttendanceLocation]);

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  };

  return {
    html,
    userPos,
    initialPos,
    currentLocation,
    isInitialized,
    mapShapes,
    mapLayers,
    mapMarkers,
    mapCenter: mapCenter || initialPos,
    activeGeofenceLocations,
    requestPermission,
    // New exports for attendance functionality
    captureLocationForAttendance,
    updateAttendanceLocation,
  };
}