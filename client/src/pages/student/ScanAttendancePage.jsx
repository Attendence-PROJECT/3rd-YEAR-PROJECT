import { useCallback, useRef, useState } from 'react';
import Alert from '../../components/Alert.jsx';
import { useQrScanner } from '../../hooks/useQrScanner.js';
import { attendanceApi } from '../../services/api.js';

export default function ScanAttendancePage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
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

  const { error: cameraError, active, elementId } = useQrScanner(handleScan, cameraOpen);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div>
        <h2 className="text-2xl font-bold text-white">Scan attendance QR</h2>
        <p className="text-sm text-white/70">
          Point your camera at the teacher&apos;s session QR code.
        </p>
      </div>

      <Alert type="success" message={success} onClose={() => setSuccess('')} />
      <Alert message={error || cameraError} onClose={() => setError('')} />

      {!cameraOpen && (
        <button
          type="button"
          onClick={() => setCameraOpen(true)}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 py-3 text-sm font-semibold text-[#03131a] shadow-lg shadow-cyan-950/30 hover:brightness-110"
        >
          Scan QR
        </button>
      )}

      {cameraOpen && (
        <div className="overflow-hidden rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="mb-4 text-center">
            <h3 className="text-lg font-semibold tracking-[0.18em] text-cyan-300 uppercase">
              Scanning QR Code
            </h3>
            <p className="mt-1 text-xs text-white/50">
              Position the QR code inside the camera frame
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute inset-0 -z-10 rounded-2xl bg-black/20 blur-xl" />

            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-3">
              <div className="pointer-events-none absolute inset-0">
                <span className="absolute left-3 top-3 h-8 w-8 rounded-tl-xl border-l-2 border-t-2 border-cyan-300/90" />
                <span className="absolute right-3 top-3 h-8 w-8 rounded-tr-xl border-r-2 border-t-2 border-cyan-300/90" />
                <span className="absolute bottom-3 left-3 h-8 w-8 rounded-bl-xl border-b-2 border-l-2 border-cyan-300/90" />
                <span className="absolute bottom-3 right-3 h-8 w-8 rounded-br-xl border-b-2 border-r-2 border-cyan-300/90" />
              </div>

              <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <div id={elementId} className="w-full" />

                {!active && !cameraError && (
                  <p className="py-8 text-center text-sm text-white/70">
                    Starting camera...
                  </p>
                )}
              </div>
            </div>
          </div>

          {active && !busy && (
            <p className="mt-4 text-center text-xs text-white/50">
              Camera active • Scan the teacher&apos;s QR code
            </p>
          )}
        </div>
      )}

      {busy && <p className="text-center text-sm text-cyan-300">Submitting attendance...</p>}
    </div>
  );
}