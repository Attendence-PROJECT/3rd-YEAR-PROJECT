import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: '',
    employeeId: '',
    department: '',
    class: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        department: form.department,
        class: form.class,
      };
      if (role === 'student') payload.rollNumber = form.rollNumber;
      if (role === 'teacher') payload.employeeId = form.employeeId;
      const u = await register(payload);
      navigate(u.role === 'teacher' ? '/teacher' : '/student');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] p-4">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgba(5,5,5,0.7),rgba(5,5,5,0.7)),url('../../GPA.jpg')] bg-cover bg-center bg-no-repeat" />
      <div className="w-full max-w-lg rounded-3xl border border-white/15 bg-white/[0.08] p-8 shadow-2xl backdrop-blur-2xl">
        <div className="mb-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.2em] text-cyan-300/80">Welcome</p>
          <h1 className="text-3xl font-bold text-white">Create account</h1>
        </div>
        <Alert message={error} onClose={() => setError('')} />
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="flex gap-2 rounded-2xl border border-white/10 bg-black/20 p-1">
            {['student', 'teacher'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-xl px-3 py-2 text-sm capitalize transition ${
                  role === r
                    ? 'bg-gradient-to-r from-cyan-400 to-sky-500 text-[#03131a] shadow-lg shadow-cyan-950/30'
                    : 'text-white/60 hover:bg-white/5'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <input
            placeholder="Full name"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="w-full"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full"
          />
          <input
            type="password"
            placeholder="Password (min 6)"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full"
          />
          {role === 'student' && (
            <>
              <input
                placeholder="Roll number"
                required
                value={form.rollNumber}
                onChange={(e) => update('rollNumber', e.target.value)}
                className="w-full"
              />
              <input
                placeholder="Class (e.g. CSE-A)"
                required
                value={form.class}
                onChange={(e) => update('class', e.target.value)}
                className="w-full"
              />
            </>
          )}
          {role === 'teacher' && (
            <input
              placeholder="Employee ID"
              required
              value={form.employeeId}
              onChange={(e) => update('employeeId', e.target.value)}
              className="w-full"
            />
          )}
          <input
            placeholder="Department (optional)"
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
            className="w-full"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 py-3 text-sm font-semibold text-[#03131a] shadow-lg shadow-cyan-950/30 hover:brightness-110 disabled:opacity-70"
          >
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-white/60">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-white hover:text-cyan-200 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
