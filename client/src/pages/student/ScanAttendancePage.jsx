import { useCallback, useRef, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { useQrScanner } from '../../hooks/useQrScanner.js';
import { attendanceApi } from '../../services/api.js';

export default function ScanAttendancePage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lastToken = useRef('');

  const handleScan = useCallback(async (text) => {
    const token = (text || '').trim();
    if (!token || busy || token === lastToken.current) return;
    lastToken.current = token;
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await attendanceApi.mark(token);
      setSuccess(data.message || 'Attendance marked!');
    } catch (err) {
      setError(err.message);
      lastToken.current = '';
    } finally {
      setBusy(false);
    }
  }, [busy]);

  const { error: cameraError, active, elementId } = useQrScanner(handleScan);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h2 className="text-2xl font-bold">Scan attendance QR</h2>
        <p className="text-sm text-slate-500">Point your camera at the teacher&apos;s session QR code.</p>
      </div>
      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error || cameraError} onClose={() => setError('')} />
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div id={elementId} className="w-full" />
        {!active && !cameraError && (
          <p className="py-8 text-center text-sm text-slate-500">Starting camera...</p>
        )}
      </div>
      {busy && <p className="text-center text-sm text-brand-600">Submitting attendance...</p>}
    </div>
  );
}
