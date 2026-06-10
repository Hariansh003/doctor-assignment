export interface Slot {
  id: string;
  doctorId: string;
  slotTime: string;
  isBooked: boolean;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  createdAt: string;
  updatedAt: string;
  slots: Slot[];
}

export interface Booking {
  id: string;
  doctorId: string;
  userName: string;
  slotTime: string;
  createdAt: string;
  doctor: Doctor;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: Array<{ field: string; message: string }>;
}

export interface DoctorFormData {
  name: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  slots: string[];
}

export interface BookingFormData {
  doctorId: string;
  userName: string;
  slotTime: string;
}

export interface DoctorFilters {
  specialization: string;
  experience: string;
  maxFee: string;
  name: string;
}
