import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  const items = [
    {
      to: '/teacher/session',
      title: 'Create session',
      desc: 'Generate expiring QR for students',
      className: 'rounded-xl border border-cyan-300/40 bg-cyan-400/10 p-6 text-white hover:bg-cyan-400/15',
    },
    {
      to: '/teacher/reports',
      title: 'Reports',
      desc: 'View class and subject attendance',
      className: 'rounded-xl border border-white/15 bg-white/8 p-6 text-white hover:bg-white/10',
    },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-white">Teacher dashboard</h2>
      <p className="text-white/70">Start an attendance session and display a QR code for your class.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map(({ to, title, desc, className }) => (
          <Link key={title} to={to} className={className}>
            <h3 className="font-semibold text-white">{title}</h3>
            <p className="mt-1 text-sm text-white/70">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
