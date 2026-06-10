import { useState, useEffect, useCallback } from 'react';
import { Doctor, Booking, DoctorFilters } from '../types';
import { doctorApi, bookingApi } from '../services/api';

export function useDoctors(filters?: Partial<DoctorFilters>) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await doctorApi.getAll(filters);
      if (response.success && response.data) {
        setDoctors(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  }, [filters?.specialization, filters?.experience, filters?.maxFee, filters?.name]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  return { doctors, loading, error, refetch: fetchDoctors };
}

export function useDoctor(id: string | undefined) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctor = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await doctorApi.getById(id);
      if (response.success && response.data) {
        setDoctor(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch doctor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDoctor();
  }, [fetchDoctor]);

  return { doctor, loading, error, refetch: fetchDoctor };
}

export function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.getAll();
      if (response.success && response.data) {
        setBookings(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
}
