export interface DoctorCreateInput {
  name: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  slots: string[];
}

export interface DoctorUpdateInput {
  name?: string;
  specialization?: string;
  experience?: number;
  consultationFee?: number;
  slots?: string[];
}

export interface BookingCreateInput {
  doctorId: string;
  userName: string;
  slotTime: string;
}

export interface DoctorFilterParams {
  specialization?: string;
  experience?: number;
  maxFee?: number;
  name?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
