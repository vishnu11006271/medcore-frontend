
export interface AvailabilityInterval {
  id?: string;
  doctorId?: string;
  dayOfWeek: number;
  startMinute: number;
  endMinute: number;
  slotDurationMinutes: number;
  isActive?: boolean;
}

export interface WeeklyAvailabilityRequest {
  schedule: AvailabilityInterval[];
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailableSlotsResponse {
  doctorId: string;
  date: string;
  slots: AvailableSlot[];
}
