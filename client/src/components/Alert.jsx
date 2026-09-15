export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null;
  const styles =
    type === 'success'
      ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
      : type === 'warning'
        ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
        : 'border-red-400/40 bg-red-500/10 text-red-100';
  return (
    <div className={`mb-4 flex justify-between gap-2 rounded-xl border px-4 py-3 text-sm ${styles}`}>
      <span>{message}</span>
      {onClose && (
        <button type="button" onClick={onClose} className="font-semibold opacity-70 hover:opacity-100">
          ×
        </button>
      )}
    </div>
  );
}
