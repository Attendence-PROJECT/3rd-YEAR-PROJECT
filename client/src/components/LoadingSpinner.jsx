export default function LoadingSpinner({ fullScreen, label = 'Loading...' }) {
  const wrap = fullScreen ? 'min-h-screen flex items-center justify-center' : 'py-8 flex justify-center';
  return (
    <div className={wrap}>
      <div className="flex flex-col items-center gap-3 text-white/70">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-300/30 border-t-cyan-400" />
        <p className="text-sm text-white/75">{label}</p>
      </div>
    </div>
  );
}
