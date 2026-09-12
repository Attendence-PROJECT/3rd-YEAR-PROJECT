import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Alert from '../../components/Alert.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { reportsApi } from '../../services/api.js';

export default function AdminDashboard() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reportsApi
      .overview()
      .then((res) => setOverview(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <Alert message={error} />;

  const chartData = (overview.classes || []).map((cls) => ({
    name: cls,
    below75: overview.studentsBelow75.filter((s) => s.class === cls).length,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Admin overview</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card label="Total students" value={overview.totalStudents} />
        <Card label="Total teachers" value={overview.totalTeachers ?? '—'} />
        <Card label="Total subjects" value={overview.totalSubjects ?? '—'} />
        <Card label="Today's attendance" value={overview.todayAttendance ?? '—'} />
        <Card label="Average attendance" value={`${overview.averageAttendance ?? 0}%`} />
        <Card label="Students below 75%" value={overview.studentsBelow75.length} />
      </div>

      <section className="rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="font-semibold">Students below 75% attendance</h3>
        {overview.studentsBelow75.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">No students below threshold.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500">
                  <th className="py-2">Name</th>
                  <th>Class</th>
                  <th>%</th>
                </tr>
              </thead>
              <tbody>
                {overview.studentsBelow75.map((row) => (
                  <tr key={row.student._id} className="border-t">
                    <td className="py-2">{row.student.name}</td>
                    <td>{row.class}</td>
                    <td className="font-semibold text-red-600">{row.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="h-72 rounded-xl border bg-white p-5 shadow-sm">
        <h3 className="mb-4 font-semibold">Low attendance count by class</h3>
        <ResponsiveContainer width="100%" height="85%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="below75" fill="#ef4444" name="Below 75%" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}

function Card({ label, value }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
