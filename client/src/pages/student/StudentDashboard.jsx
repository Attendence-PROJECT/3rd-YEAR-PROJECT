import { useEffect, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { attendanceApi } from '../../services/api.js';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const studentId = user.studentId || 'me';
        const res = await attendanceApi.student(studentId);
        if (mounted) setData(res.data);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [user.studentId]);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert message={error} />;

  const stats = data?.stats || {};
  const bySubject = data?.bySubject || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-slate-500">Welcome back, {user.name}</p>
      </div>

      {stats.lowAttendanceWarning && (
        <Alert
          type="warning"
          message="Your overall attendance is below 75%. Please attend upcoming sessions."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Overall attendance" value={`${stats.percentage ?? 0}%`} />
        <StatCard label="Sessions attended" value={stats.presentCount ?? 0} />
        <StatCard
          label="Today"
          value={stats.markedToday ? 'Present' : 'Not marked'}
          sub={stats.markedToday?.subject?.name}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="font-semibold text-slate-900">Subject-wise attendance</h3>
        {bySubject.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No attendance records yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-slate-100">
            {bySubject.map((row) => (
              <li key={row.subject._id} className="flex items-center justify-between py-3 text-sm">
                <span>
                  {row.subject.name} ({row.subject.code})
                </span>
                <span className="font-semibold text-brand-700">{row.percentage}%</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}
