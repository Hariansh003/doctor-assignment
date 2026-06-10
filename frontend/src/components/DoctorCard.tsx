import { Link } from 'react-router-dom';
import { Doctor } from '../types';

interface DoctorCardProps {
  doctor: Doctor;
}

export default function DoctorCard({ doctor }: DoctorCardProps) {
  const availableSlots = doctor.slots.filter((s) => !s.isBooked).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
          <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
            {doctor.specialization}
          </span>
        </div>
        <p className="text-lg font-bold text-indigo-600">₹{doctor.consultationFee}</p>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <span>{doctor.experience} yrs experience</span>
        <span className={`font-medium ${availableSlots > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {availableSlots} slot{availableSlots !== 1 ? 's' : ''} available
        </span>
      </div>

      <Link
        to={`/doctors/${doctor.id}`}
        className="inline-block w-full text-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
      >
        View Details & Book
      </Link>
    </div>
  );
}
