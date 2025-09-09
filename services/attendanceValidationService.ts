// services/attendanceValidationService.ts
import {
  IIT_GUWAHATI_LOCATION,
  getDepartmentLocation
} from "@/constants/geofenceLocation";
import { LatLng } from "@/types/geofence";

export interface ValidationResult {
  isValid: boolean;
  reason?: string;
  details?: {
    isWithinWorkingHours: boolean;
    isInsideIIT: boolean;
    isInsideDepartment: boolean;
    currentSession?: "FORENOON" | "AFTERNOON" | "OUTSIDE";
    userLocation?: string;
  };
}

export class AttendanceValidationService {
  // Working hours configuration
  private readonly WORKING_HOURS = {
    FORENOON: {
      start: { hour: 9, minute: 0 },  // 9:00 AM
      end: { hour: 13, minute: 0 }      // 1:00 PM
    },
    AFTERNOON: {
      start: { hour: 13, minute: 0 },   // 1:00 PM  
      end: { hour: 17, minute: 30 }      // 5:30 PM
    }
  };

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  private calculateDistance(point1: LatLng, point2: LatLng): number {
    const R = 6371000; // Earth's radius in meters
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    
    const dLat = toRad(point2.lat - point1.lat);
    const dLng = toRad(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(point1.lat)) * 
      Math.cos(toRad(point2.lat)) * 
      Math.sin(dLng / 2) ** 2;
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if current time is within working hours
   */
  public isWithinWorkingHours(): { 
    isValid: boolean; 
    session: "FORENOON" | "AFTERNOON" | "OUTSIDE";
    timeInfo: string;
  } {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTimeInMinutes = currentHours * 60 + currentMinutes;

    const forenoonStart = this.WORKING_HOURS.FORENOON.start.hour * 60 + 
                         this.WORKING_HOURS.FORENOON.start.minute;
    const forenoonEnd = this.WORKING_HOURS.FORENOON.end.hour * 60 + 
                       this.WORKING_HOURS.FORENOON.end.minute;
    
    const afternoonStart = this.WORKING_HOURS.AFTERNOON.start.hour * 60 + 
                          this.WORKING_HOURS.AFTERNOON.start.minute;
    const afternoonEnd = this.WORKING_HOURS.AFTERNOON.end.hour * 60 + 
                        this.WORKING_HOURS.AFTERNOON.end.minute;

    if (currentTimeInMinutes >= forenoonStart && currentTimeInMinutes < forenoonEnd) {
      return { 
        isValid: true, 
        session: "FORENOON",
        timeInfo: "Forenoon Session (9:00 AM - 1:00 PM)"
      };
    } else if (currentTimeInMinutes >= afternoonStart && currentTimeInMinutes <= afternoonEnd) {
      return { 
        isValid: true, 
        session: "AFTERNOON",
        timeInfo: "Afternoon Session (1:00 PM - 5:30 PM)"
      };
    } else {
      let nextSession = "";
      if (currentTimeInMinutes < forenoonStart) {
        const minutesUntil = forenoonStart - currentTimeInMinutes;
        const hours = Math.floor(minutesUntil / 60);
        const minutes = minutesUntil % 60;
        nextSession = `Next session starts in ${hours}h ${minutes}m (9:00 AM)`;
      } else {
        nextSession = "Working hours have ended. Next session starts tomorrow at 9:00 AM";
      }
      
      return { 
        isValid: false, 
        session: "OUTSIDE",
        timeInfo: nextSession
      };
    }
  }

  /**
   * Check if user is inside IIT Guwahati campus
   */
  public isInsideIIT(userPosition: LatLng): boolean {
    const distance = this.calculateDistance(
      userPosition, 
      IIT_GUWAHATI_LOCATION.center
    );
    return distance <= IIT_GUWAHATI_LOCATION.radius;
  }

  /**
   * Check if user is inside their department radius
   */
  public isInsideDepartment(
    userPosition: LatLng, 
    departmentId: string
  ): { isInside: boolean; distance?: number } {
    const department = getDepartmentLocation(departmentId);
    
    if (!department) {
      console.warn(`Department ${departmentId} not found`);
      return { isInside: false };
    }

    const distance = this.calculateDistance(userPosition, department.center);
    return { 
      isInside: distance <= department.radius,
      distance: Math.round(distance)
    };
  }

  /**
   * Validate if user can mark attendance
   */
  public validateAttendance(
    userPosition: LatLng,
    departmentId: string,
    userLocationType: "CAMPUS" | "FIELDTRIP" | null
  ): ValidationResult {
    // For field trips, only check working hours
    if (userLocationType === "FIELDTRIP") {
      const timeCheck = this.isWithinWorkingHours();
      
      if (!timeCheck.isValid) {
        return {
          isValid: false,
          reason: `Cannot mark attendance outside working hours. ${timeCheck.timeInfo}`,
          details: {
            isWithinWorkingHours: false,
            isInsideIIT: false,
            isInsideDepartment: false,
            currentSession: timeCheck.session,
            userLocation: "Field Trip"
          }
        };
      }

      return {
        isValid: true,
        details: {
          isWithinWorkingHours: true,
          isInsideIIT: false,
          isInsideDepartment: false,
          currentSession: timeCheck.session,
          userLocation: "Outside IIT (Field Trip)"
        }
      };
    }

    // For CAMPUS mode, check everything
    const timeCheck = this.isWithinWorkingHours();
    const isInsideIIT = this.isInsideIIT(userPosition);
    const departmentCheck = this.isInsideDepartment(userPosition, departmentId);

    // First check: Working hours
    if (!timeCheck.isValid) {
      return {
        isValid: false,
        reason: `Cannot mark attendance outside working hours. ${timeCheck.timeInfo}`,
        details: {
          isWithinWorkingHours: false,
          isInsideIIT,
          isInsideDepartment: departmentCheck.isInside,
          currentSession: timeCheck.session
        }
      };
    }

    // Second check: Inside IIT campus
    if (!isInsideIIT) {
      return {
        isValid: false,
        reason: "You must be inside IIT Guwahati campus to mark attendance.",
        details: {
          isWithinWorkingHours: true,
          isInsideIIT: false,
          isInsideDepartment: false,
          currentSession: timeCheck.session,
          userLocation: "Outside IIT Guwahati"
        }
      };
    }

    // Third check: Inside department radius
    if (!departmentCheck.isInside) {
      const department = getDepartmentLocation(departmentId);
      const distanceInfo = departmentCheck.distance 
        ? ` You are ${departmentCheck.distance}m away from ${department?.label || 'your department'}.`
        : "";
      
      return {
        isValid: false,
        reason: `You must be within 200 meters of your department to mark attendance.${distanceInfo}`,
        details: {
          isWithinWorkingHours: true,
          isInsideIIT: true,
          isInsideDepartment: false,
          currentSession: timeCheck.session,
          userLocation: `Outside Department (${departmentCheck.distance}m away)`
        }
      };
    }

    // All checks passed
    const department = getDepartmentLocation(departmentId);
    return {
      isValid: true,
      details: {
        isWithinWorkingHours: true,
        isInsideIIT: true,
        isInsideDepartment: true,
        currentSession: timeCheck.session,
        userLocation: department?.label || "Department"
      }
    };
  }

  /**
   * Get user's current location status
   */
  public getLocationStatus(
    userPosition: LatLng,
    departmentId: string,
    userLocationType: "CAMPUS" | "FIELDTRIP" | null
  ): string {
    if (userLocationType === "FIELDTRIP") {
      return "Outside IIT (Field Trip)";
    }

    const isInsideIIT = this.isInsideIIT(userPosition);
    if (!isInsideIIT) {
      return "Outside IIT Guwahati";
    }

    const departmentCheck = this.isInsideDepartment(userPosition, departmentId);
    if (departmentCheck.isInside) {
      const department = getDepartmentLocation(departmentId);
      return department?.label || "Inside Department";
    }

    return "Inside IIT Guwahati (Outside Department)";
  }
}

// Export singleton instance
export const attendanceValidation = new AttendanceValidationService();