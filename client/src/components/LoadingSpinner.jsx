export default function LoadingSpinner({ fullScreen, label = 'Loading...' }) {
  const wrap = fullScreen ? 'min-h-screen flex items-center justify-center' : 'py-8 flex justify-center';
  return (
    <div className={wrap}>
      <div className="flex flex-col items-center gap-3 text-slate-600">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
        <p className="text-sm">{label}</p>
      </div>
    </div>
  );
}
