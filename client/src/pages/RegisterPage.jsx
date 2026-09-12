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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold">Register</h1>
        <Alert message={error} onClose={() => setError('')} />
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div className="flex gap-2">
            {['student', 'teacher'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 rounded-lg border px-3 py-2 text-sm capitalize ${
                  role === r ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-slate-200'
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
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <input
            type="password"
            placeholder="Password (min 6)"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          {role === 'student' && (
            <>
              <input
                placeholder="Roll number"
                required
                value={form.rollNumber}
                onChange={(e) => update('rollNumber', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <input
                placeholder="Class (e.g. CSE-A)"
                required
                value={form.class}
                onChange={(e) => update('class', e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </>
          )}
          {role === 'teacher' && (
            <input
              placeholder="Employee ID"
              required
              value={form.employeeId}
              onChange={(e) => update('employeeId', e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
          )}
          <input
            placeholder="Department (optional)"
            value={form.department}
            onChange={(e) => update('department', e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            {submitting ? 'Creating account...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
