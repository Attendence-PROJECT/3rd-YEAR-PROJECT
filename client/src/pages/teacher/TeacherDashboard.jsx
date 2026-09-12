import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Teacher dashboard</h2>
      <p className="text-slate-600">Start an attendance session and display a QR code for your class.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          to="/teacher/session"
          className="rounded-xl border border-brand-200 bg-brand-50 p-6 text-brand-800 hover:bg-brand-100"
        >
          <h3 className="font-semibold">Create session</h3>
          <p className="mt-1 text-sm">Generate expiring QR for students</p>
        </Link>
        <Link
          to="/teacher/reports"
          className="rounded-xl border border-slate-200 bg-white p-6 hover:bg-slate-50"
        >
          <h3 className="font-semibold">Reports</h3>
          <p className="mt-1 text-sm">View class and subject attendance</p>
        </Link>
      </div>
    </div>
  );
}
