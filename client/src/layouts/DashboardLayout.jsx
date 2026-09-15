import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function navClass({ isActive }) {
  return `block rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
    isActive
      ? 'bg-gradient-to-r from-cyan-400/90 to-sky-500/90 text-[#03131a] shadow-lg shadow-cyan-950/30'
      : 'text-white/70 hover:bg-white/5 hover:text-white'
  }`;
}

export default function DashboardLayout({ title, links }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white lg:flex">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(5,5,5,0.7),rgba(5,5,5,0.7)),url('../../GPA.jpg')] bg-cover bg-center bg-no-repeat" />
      <aside className="w-full border-b border-white/10 bg-black/35 backdrop-blur-xl lg:min-h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Smart Attendance</p>
          <h1 className="mt-2 text-lg font-bold text-white">{title}</h1>
          <p className="mt-3 text-sm text-white/70">{user?.name}</p>
          <p className="text-xs capitalize text-white/45">{user?.role}</p>
        </div>
        <nav className="space-y-1 px-3 pb-4 lg:pb-8">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={navClass}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
