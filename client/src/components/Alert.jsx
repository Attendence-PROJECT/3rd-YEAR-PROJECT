export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  const styles =
    type === 'success'
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : type === 'warning'
        ? 'bg-amber-50 text-amber-900 border-amber-200'
        : 'bg-red-50 text-red-800 border-red-200';
  return (
    <div className={`mb-4 rounded-lg border px-4 py-3 text-sm ${styles} flex justify-between gap-2`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="font-semibold opacity-70 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}
