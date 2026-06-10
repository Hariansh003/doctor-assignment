import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDoctor } from '../hooks/useData';
import { bookingApi } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import { Booking, Slot } from '../types';

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { doctor, loading, error, refetch } = useDoctor(id);
  const [userName, setUserName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [confirmation, setConfirmation] = useState<Booking | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (loading) return <LoadingSpinner message="Loading doctor details..." />;
  if (error || !doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500 text-lg">{error || 'Doctor not found'}</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to doctors
        </Link>
      </div>
    );
  }

  const availableSlots = doctor.slots.filter((s) => !s.isBooked);

  // Group slots by date
  const slotsByDate: Record<string, Slot[]> = {};
  availableSlots.forEach((slot) => {
    const date = new Date(slot.slotTime).toLocaleDateString('en-IN', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
    if (!slotsByDate[date]) slotsByDate[date] = [];
    slotsByDate[date].push(slot);
  });

  const handleBook = async () => {
    if (!selectedSlot || !userName.trim()) return;
    try {
      setBooking(true);
      const response = await bookingApi.create({
        doctorId: doctor.id,
        userName: userName.trim(),
        slotTime: selectedSlot,
      });
      if (response.success && response.data) {
        setConfirmation(response.data);
        setToast({ message: 'Booking confirmed!', type: 'success' });
        setSelectedSlot(null);
        setUserName('');
        refetch();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Booking failed. Please try again.';
      setToast({ message: msg, type: 'error' });
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <Link to="/" className="inline-flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 mb-6">
        ← Back to doctors
      </Link>

      {/* Doctor Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{doctor.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700">
              {doctor.specialization}
            </span>
            <div className="mt-3 flex items-center gap-6 text-sm text-gray-500">
              <span>{doctor.experience} years experience</span>
              <span>{availableSlots.length} slots available</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Consultation Fee</p>
            <p className="text-3xl font-bold text-indigo-600">₹{doctor.consultationFee}</p>
          </div>
        </div>
      </div>

      {/* Booking Confirmation */}
      {confirmation && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-green-800 mb-3">✓ Booking Confirmed</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-green-600">Patient</p>
              <p className="font-medium text-green-900">{confirmation.userName}</p>
            </div>
            <div>
              <p className="text-green-600">Doctor</p>
              <p className="font-medium text-green-900">{doctor.name}</p>
            </div>
            <div>
              <p className="text-green-600">Date & Time</p>
              <p className="font-medium text-green-900">
                {new Date(confirmation.slotTime).toLocaleString('en-IN', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-green-600">Booking ID</p>
              <p className="font-medium text-green-900 text-xs">{confirmation.id}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Slots */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Available Slots</h2>
          {Object.keys(slotsByDate).length === 0 ? (
            <p className="text-gray-500 py-8 text-center">No available slots at the moment.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(slotsByDate).map(([date, slots]) => (
                <div key={date} className="bg-white rounded-lg border border-gray-200 p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">{date}</p>
                  <div className="flex flex-wrap gap-2">
                    {slots.map((slot) => (
                      <button
                        key={slot.id}
                        onClick={() => setSelectedSlot(slot.slotTime)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                          selectedSlot === slot.slotTime
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      >
                        {new Date(slot.slotTime).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking Form */}
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 sticky top-24">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Book Consultation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {selectedSlot && (
                <div className="bg-indigo-50 rounded-lg p-3">
                  <p className="text-xs text-indigo-600">Selected slot</p>
                  <p className="text-sm font-medium text-indigo-900">
                    {new Date(selectedSlot).toLocaleString('en-IN', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}

              <button
                onClick={handleBook}
                disabled={!selectedSlot || !userName.trim() || booking}
                className="w-full px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {booking ? 'Booking...' : 'Confirm Booking'}
              </button>

              {!selectedSlot && (
                <p className="text-xs text-gray-400 text-center">Select a time slot to book</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
