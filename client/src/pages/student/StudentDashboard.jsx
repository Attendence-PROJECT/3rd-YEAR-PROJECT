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

  const statCards = [
    ['Overall attendance', `${stats.percentage ?? 0}%`],
    ['Sessions attended', stats.presentCount ?? 0],
    ['Today', stats.markedToday ? 'Present' : 'Not marked', stats.markedToday?.subject?.name],
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-white/70">Welcome back, {user.name}</p>
      </div>

      {stats.lowAttendanceWarning && (
        <Alert
          type="warning"
          message="Your overall attendance is below 75%. Please attend upcoming sessions."
        />
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {statCards.map(([label, value, sub]) => (
          <StatCard key={label} label={label} value={value} sub={sub} />
        ))}
      </div>

      <section className="rounded-xl border border-white/15 bg-white/8 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <h3 className="font-semibold text-white">Subject-wise attendance</h3>
        {bySubject.length === 0 ? (
          <p className="mt-3 text-sm text-white/70">No attendance records yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-white/10">
            {bySubject.map((row) => (
              <li key={row.subject._id} className="flex items-center justify-between py-3 text-sm text-white/80">
                <span>
                  {row.subject.name} ({row.subject.code})
                </span>
                <span className="font-semibold text-cyan-300">{row.percentage}%</span>
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
    <div className="rounded-xl border border-white/15 bg-white/8 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
      <p className="text-xs font-medium uppercase tracking-wide text-white/70">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/70">{sub}</p>}
    </div>
  );
}
