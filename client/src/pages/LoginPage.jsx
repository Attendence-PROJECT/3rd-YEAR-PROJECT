import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';

import Alert from '../components/Alert.jsx';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { LiquidButton } from '../components/ui/liquid-glass-button.jsx';

import collegeImage from '../../../GPA.jpg';


function roleHome(role) {
  if (role === 'admin') return '/admin';
  if (role === 'teacher') return '/teacher';
  return '/student';
}


export default function LoginPage() {

  const { user, loading, login } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);


  // Authentication loading
  if (loading) return <LoadingSpinner fullScreen />;


  // Already logged in
  if (user) {
    return <Navigate to={roleHome(user.role)} replace />;
  }


  // Login form submit
  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');
    setSubmitting(true);

    try {

      const loggedIn = await login(email, password);

      navigate(roleHome(loggedIn.role));

    } catch (err) {

      setError(err.message);

    } finally {

      setSubmitting(false);

    }
  };


  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={collegeImage}
          alt="Government Polytechnic Ambad"
          className="h-full w-full scale-105 object-cover opacity-60 blur-[2px]"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-950/60 to-slate-900/75" />
      </div>

      <div className="absolute -top-28 -left-20 h-72 w-72 rounded-full bg-violet-500/20 blur-3xl" />
      <div className="absolute -bottom-20 -right-16 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-[0.12em] text-white sm:text-3xl lg:text-4xl">
            GOVERNMENT POLYTECHNIC AMBAD
          </h1>
          <p className="mt-2 text-xs uppercase tracking-[0.28em] text-white/70 sm:text-sm">
            Smart Attendance Management System
          </p>
        </header>

        <div className="w-full max-w-md rounded-[30px] border border-white/16 bg-white/8 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl sm:p-8">
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-medium text-white/60">Welcome back</p>
            <h2 className="text-3xl font-bold text-white">Sign in</h2>
            <p className="mt-2 text-sm text-white/55"></p>
          </div>

          <Alert message={error} onClose={() => setError('')} />

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 backdrop-blur-md transition focus:border-cyan-300 focus:bg-white/10 focus:ring-2 focus:ring-cyan-300/35"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-xl border border-white/15 bg-black/20 px-4 py-3 text-white outline-none placeholder:text-white/30 backdrop-blur-md transition focus:border-cyan-300 focus:bg-white/10 focus:ring-2 focus:ring-cyan-300/35"
              />
            </div>

            <LiquidButton type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Signing in...' : 'Sign in →'}
            </LiquidButton>
          </form>

          <p className="mt-7 text-center text-sm text-white/60">
            Student or teacher?{' '}
            <Link to="/register" className="font-medium text-white hover:text-white/80 hover:underline">
              Create account
            </Link>
          </p>

          <div className="mt-8 border-t border-white/10 pt-5 text-center">
            <p className="text-xs text-white/35">Government Polytechnic Ambad</p>
            <p className="mt-1 text-xs text-white/20">Smart Attendance System</p>
          </div>
        </div>
      </div>
    </div>
  );
}