import axios from 'axios';
import { Doctor, Booking, ApiResponse, DoctorFormData, BookingFormData, DoctorFilters } from '../types';
import { authService } from './auth';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request if available
api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const doctorApi = {
  getAll: async (filters?: Partial<DoctorFilters>) => {
    const params: Record<string, string> = {};
    if (filters?.specialization) params.specialization = filters.specialization;
    if (filters?.experience) params.experience = filters.experience;
    if (filters?.maxFee) params.maxFee = filters.maxFee;
    if (filters?.name) params.name = filters.name;
    const response = await api.get<ApiResponse<Doctor[]>>('/doctors', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get<ApiResponse<Doctor>>(`/doctors/${id}`);
    return response.data;
  },

  create: async (data: DoctorFormData) => {
    const response = await api.post<ApiResponse<Doctor>>('/doctors', data);
    return response.data;
  },

  update: async (id: string, data: Partial<DoctorFormData>) => {
    const response = await api.put<ApiResponse<Doctor>>(`/doctors/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/doctors/${id}`);
    return response.data;
  },
};

export const bookingApi = {
  getAll: async () => {
    const response = await api.get<ApiResponse<Booking[]>>('/bookings');
    return response.data;
  },

  create: async (data: BookingFormData) => {
    const response = await api.post<ApiResponse<Booking>>('/bookings', data);
    return response.data;
  },
};
