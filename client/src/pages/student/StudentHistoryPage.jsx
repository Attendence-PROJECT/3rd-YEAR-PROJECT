import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { attendanceApi } from '../../services/api.js';

export default function StudentHistoryPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await attendanceApi.student(user.studentId || 'me');
        setRecords(res.data.records || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.studentId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert message={error} />;

  return (
    <div>
      <h2 className="text-2xl font-bold text-white">Attendance history</h2>
      {records.length === 0 ? (
        <p className="mt-4 text-white/70">No records yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-white/15 bg-white/8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <table className="min-w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white/80">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Marked at</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id} className="border-t border-white/10">
                  <td className="px-4 py-3">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{r.subject?.name}</td>
                  <td className="px-4 py-3 capitalize">{r.status}</td>
                  <td className="px-4 py-3">{new Date(r.markedAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
