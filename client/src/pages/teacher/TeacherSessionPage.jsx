import { useCallback, useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Alert from '../../components/Alert.jsx';
import LoadingSpinner from '../../components/LoadingSpinner.jsx';
import { sessionsApi, subjectsApi } from '../../services/api.js';

function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => {
      const ms = new Date(expiresAt).getTime() - Date.now();
      setRemaining(Math.max(0, Math.floor(ms / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0');
  const ss = String(remaining % 60).padStart(2, '0');
  return { remaining, label: `${mm}:${ss}` };
}

export default function TeacherSessionPage() {
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [className, setClassName] = useState('');
  const [duration, setDuration] = useState(15);
  const [session, setSession] = useState(null);
  const [qrPayload, setQrPayload] = useState('');
  const [present, setPresent] = useState([]);
  const [error, setError] = useState('');
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [creating, setCreating] = useState(false);

  const countdown = useCountdown(session?.expiresAt);

  useEffect(() => {
    subjectsApi
      .list()
      .then((res) => setSubjects(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoadingSubjects(false));
  }, []);

  const refreshPresent = useCallback(async (sessionId) => {
    try {
      const { data } = await sessionsApi.attendance(sessionId);
      setPresent(data.records || []);
    } catch {
      /* ignore polling errors */
    }
  }, []);

  useEffect(() => {
    if (!session?._id || session.status !== 'active') return undefined;
    refreshPresent(session._id);
    const id = setInterval(() => refreshPresent(session._id), 5000);
    return () => clearInterval(id);
  }, [session, refreshPresent]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setCreating(true);
    try {
      const { data } = await sessionsApi.create({
        subjectId,
        class: className,
        durationMinutes: duration,
      });
      setSession(data.session);
      setQrPayload(data.qrPayload);
      setPresent([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleClose = async () => {
    if (!session) return;
    try {
      const { data } = await sessionsApi.close(session._id);
      setSession(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loadingSubjects) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Attendance session</h2>
      <Alert message={error} onClose={() => setError('')} />

      {!session && (
        <form onSubmit={handleCreate} className="max-w-md space-y-3 rounded-xl border bg-white p-5 shadow-sm">
          <div>
            <label className="text-sm font-medium">Subject</label>
            <select
              required
              value={subjectId}
              onChange={(e) => {
                const id = e.target.value;
                setSubjectId(id);
                const sub = subjects.find((s) => s._id === id);
                if (sub) setClassName(sub.class);
              }}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} — {s.name} ({s.class})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium">Class</label>
            <input
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <div>
            <label className="text-sm font-medium">QR duration (minutes)</label>
            <input
              type="number"
              min={5}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
          </div>
          <button
            type="submit"
            disabled={creating}
            className="w-full rounded-lg bg-brand-600 py-2 text-white hover:bg-brand-700"
          >
            {creating ? 'Creating...' : 'Start session & generate QR'}
          </button>
        </form>
      )}

      {session && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-slate-500">
              {session.subject?.name} · {session.class}
            </p>
            <p className="mt-2 text-lg font-semibold">
              Status: <span className="capitalize">{session.status}</span>
            </p>
            {session.status === 'active' && (
              <p className="mt-1 text-3xl font-mono font-bold text-brand-600">{countdown.label}</p>
            )}
            <div className="mt-4 inline-block rounded-xl bg-white p-4 shadow-inner">
              <QRCodeSVG value={qrPayload} size={220} level="M" includeMargin />
            </div>
            <p className="mt-3 break-all text-xs text-slate-400">Token: {qrPayload}</p>
            {session.status === 'active' && (
              <button
                type="button"
                onClick={handleClose}
                className="mt-4 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Close session
              </button>
            )}
          </div>
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <h3 className="font-semibold">Present students ({present.length})</h3>
            {present.length === 0 ? (
              <p className="mt-3 text-sm text-slate-500">Waiting for scans...</p>
            ) : (
              <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto text-sm">
                {present.map((row) => (
                  <li key={row._id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span>{row.student?.name}</span>
                    <span className="text-slate-500">{row.student?.rollNumber}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
