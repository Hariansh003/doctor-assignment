import { useBookings } from '../hooks/useData';
import LoadingSpinner from '../components/LoadingSpinner';

export default function BookingsPage() {
  const { bookings, loading, error } = useBookings();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Bookings</h1>
      <p className="text-gray-500 mb-8">All consultation bookings.</p>

      {loading && <LoadingSpinner message="Loading bookings..." />}

      {error && <p className="text-red-500 text-center py-12">{error}</p>}

      {!loading && !error && bookings.length === 0 && (
        <p className="text-gray-500 text-center py-12 text-lg">No bookings yet.</p>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Patient</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Doctor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Specialization</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Slot</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Booked At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{b.userName}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">{b.doctor?.name || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{b.doctor?.specialization || 'N/A'}</td>
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {new Date(b.slotTime).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">
                    {new Date(b.createdAt).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
