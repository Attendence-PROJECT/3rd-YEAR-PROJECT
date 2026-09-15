import { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export function useQrScanner(onScan, enabled = false) {
  const scannerRef = useRef(null);
  const onScanRef = useRef(onScan);
  const [error, setError] = useState('');
  const [active, setActive] = useState(false);
  const elementId = 'qr-reader';

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    if (!enabled) {
      const instance = scannerRef.current;
      if (instance) {
        instance
          .stop()
          .then(() => instance.clear())
          .catch(() => {});
      }
      scannerRef.current = null;
      setActive(false);
      setError('');
      return;
    }

    let cancelled = false;
    const scanner = new Html5Qrcode(elementId);
    scannerRef.current = scanner;

    async function start() {
      try {
        setError('');
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (onScanRef.current) onScanRef.current(decodedText);
          },
          () => {}
        );
        if (!cancelled) setActive(true);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Could not access camera');
          setActive(false);
        }
      }
    }

    start();

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (!instance) return;
      instance
        .stop()
        .then(() => instance.clear())
        .catch(() => {});
      scannerRef.current = null;
      setActive(false);
    };
  }, [enabled]);

  return { error, active, elementId };
}
