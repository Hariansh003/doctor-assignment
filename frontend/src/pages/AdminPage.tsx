import { useState } from 'react';
import { useDoctors } from '../hooks/useData';
import { doctorApi } from '../services/api';
import { Doctor, DoctorFormData } from '../types';
import DoctorForm from '../components/DoctorForm';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

export default function AdminPage() {
  const { doctors, loading, error, refetch } = useDoctors();
  const [showForm, setShowForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleCreate = async (data: DoctorFormData) => {
    try {
      setIsSubmitting(true);
      const response = await doctorApi.create(data);
      if (response.success) {
        setToast({ message: 'Doctor created successfully!', type: 'success' });
        setShowForm(false);
        refetch();
      }
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Failed to create doctor',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (data: DoctorFormData) => {
    if (!editingDoctor) return;
    try {
      setIsSubmitting(true);
      const updatePayload: Partial<DoctorFormData> = {
        name: data.name,
        specialization: data.specialization,
        experience: data.experience,
        consultationFee: data.consultationFee,
      };
      if (data.slots.length > 0) {
        updatePayload.slots = data.slots;
      }
      const response = await doctorApi.update(editingDoctor.id, updatePayload);
      if (response.success) {
        setToast({ message: 'Doctor updated successfully!', type: 'success' });
        setEditingDoctor(null);
        refetch();
      }
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Failed to update doctor',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (doctor: Doctor) => {
    if (!window.confirm(`Are you sure you want to delete ${doctor.name}?`)) return;
    try {
      const response = await doctorApi.delete(doctor.id);
      if (response.success) {
        setToast({ message: 'Doctor deleted successfully!', type: 'success' });
        refetch();
      }
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Failed to delete doctor',
        type: 'error',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="mt-1 text-gray-500">Manage doctors and their availability.</p>
        </div>
        {!showForm && !editingDoctor && (
          <button
            onClick={() => setShowForm(true)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            + Add Doctor
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Doctor</h2>
          <DoctorForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Edit Form */}
      {editingDoctor && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Doctor</h2>
          <DoctorForm
            doctor={editingDoctor}
            onSubmit={handleUpdate}
            onCancel={() => setEditingDoctor(null)}
            isSubmitting={isSubmitting}
          />
        </div>
      )}

      {/* Doctor List */}
      {loading && <LoadingSpinner message="Loading doctors..." />}

      {error && <p className="text-red-500 text-center py-8">{error}</p>}

      {!loading && !error && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Exp</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Fee</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Slots</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {doctors.map((doc) => {
                const available = doc.slots.filter((s) => !s.isBooked).length;
                return (
                  <tr key={doc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{doc.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doc.specialization}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{doc.experience} yrs</td>
                    <td className="px-6 py-4 text-sm text-gray-600">₹{doc.consultationFee}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-medium ${available > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {available}/{doc.slots.length}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setShowForm(false);
                          setEditingDoctor(doc);
                        }}
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(doc)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {doctors.length === 0 && (
            <p className="text-gray-500 text-center py-8">No doctors added yet.</p>
          )}
        </div>
      )}
    </div>
  );
}
