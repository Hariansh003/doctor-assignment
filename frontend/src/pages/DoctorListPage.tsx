import { useState, useMemo } from 'react';
import { useDoctors } from '../hooks/useData';
import DoctorCard from '../components/DoctorCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { DoctorFilters } from '../types';

const SPECIALIZATIONS = [
  'All',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'General Medicine',
  'Gynecology',
  'ENT',
  'Ophthalmology',
  'Psychiatry',
];

export default function DoctorListPage() {
  const [filters, setFilters] = useState<DoctorFilters>({
    specialization: '',
    experience: '',
    maxFee: '',
    name: '',
  });

  const activeFilters = useMemo(() => {
    const f: Partial<DoctorFilters> = {};
    if (filters.specialization && filters.specialization !== 'All') f.specialization = filters.specialization;
    if (filters.experience) f.experience = filters.experience;
    if (filters.maxFee) f.maxFee = filters.maxFee;
    if (filters.name) f.name = filters.name;
    return f;
  }, [filters]);

  const { doctors, loading, error } = useDoctors(activeFilters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Find a Doctor</h1>
        <p className="mt-1 text-gray-500">Browse and book consultations with our doctors.</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Search by name</label>
            <input
              type="text"
              value={filters.name}
              onChange={(e) => setFilters({ ...filters, name: e.target.value })}
              placeholder="e.g. Dr. Priya"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Specialization</label>
            <select
              value={filters.specialization}
              onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              {SPECIALIZATIONS.map((spec) => (
                <option key={spec} value={spec === 'All' ? '' : spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Min experience (yrs)</label>
            <input
              type="number"
              value={filters.experience}
              onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
              placeholder="e.g. 5"
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Max fee (₹)</label>
            <input
              type="number"
              value={filters.maxFee}
              onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
              placeholder="e.g. 500"
              min={0}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      {loading && <LoadingSpinner message="Loading doctors..." />}

      {error && (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      )}

      {!loading && !error && doctors.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No doctors found matching your criteria.</p>
        </div>
      )}

      {!loading && !error && doctors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
