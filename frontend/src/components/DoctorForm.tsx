import { useState, useEffect } from 'react';
import { Doctor, DoctorFormData } from '../types';

interface DoctorFormProps {
  doctor?: Doctor | null;
  onSubmit: (data: DoctorFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const SPECIALIZATIONS = [
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

export default function DoctorForm({ doctor, onSubmit, onCancel, isSubmitting }: DoctorFormProps) {
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState(0);
  const [consultationFee, setConsultationFee] = useState(0);
  const [slotDate, setSlotDate] = useState('');
  const [slotTimes, setSlotTimes] = useState<string[]>([]);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);

  useEffect(() => {
    if (doctor) {
      setName(doctor.name);
      setSpecialization(doctor.specialization);
      setExperience(doctor.experience);
      setConsultationFee(doctor.consultationFee);
    }
  }, [doctor]);

  const timeOptions = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];

  const addSlots = () => {
    if (!slotDate || selectedTimes.length === 0) return;
    const newSlots = selectedTimes
      .map((time) => {
        const dt = new Date(`${slotDate}T${time}:00`);
        return dt.toISOString();
      })
      .filter((s) => !slotTimes.includes(s));
    setSlotTimes([...slotTimes, ...newSlots]);
    setSelectedTimes([]);
  };

  const removeSlot = (slot: string) => {
    setSlotTimes(slotTimes.filter((s) => s !== slot));
  };

  const toggleTime = (time: string) => {
    setSelectedTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      name,
      specialization,
      experience,
      consultationFee,
      slots: slotTimes,
    });
  };

  const isEditing = !!doctor;
  const minDate = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Dr. John Doe"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
        <select
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="">Select specialization</option>
          {SPECIALIZATIONS.map((spec) => (
            <option key={spec} value={spec}>
              {spec}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
          <input
            type="number"
            value={experience}
            onChange={(e) => setExperience(Number(e.target.value))}
            min={0}
            max={60}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Consultation Fee (₹)</label>
          <input
            type="number"
            value={consultationFee}
            onChange={(e) => setConsultationFee(Number(e.target.value))}
            min={0}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Slot management */}
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isEditing ? 'Add New Slots' : 'Available Slots'}
        </label>
        <div className="flex gap-3 items-end mb-3">
          <div className="flex-1">
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              min={minDate}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="button"
            onClick={addSlots}
            disabled={!slotDate || selectedTimes.length === 0}
            className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium hover:bg-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </button>
        </div>

        {slotDate && (
          <div className="flex flex-wrap gap-2 mb-3">
            {timeOptions.map((time) => (
              <button
                key={time}
                type="button"
                onClick={() => toggleTime(time)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedTimes.includes(time)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        )}

        {slotTimes.length > 0 && (
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500 mb-1">Added slots:</p>
            <div className="flex flex-wrap gap-1.5">
              {slotTimes.map((slot) => (
                <span
                  key={slot}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded text-xs"
                >
                  {new Date(slot).toLocaleString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  <button type="button" onClick={() => removeSlot(slot)} className="text-green-500 hover:text-red-500">
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {!isEditing && slotTimes.length === 0 && (
          <p className="text-xs text-amber-600">Please add at least one slot.</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || (!isEditing && slotTimes.length === 0)}
          className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update Doctor' : 'Create Doctor'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
