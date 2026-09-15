import { forwardRef } from 'react';

const LiquidButton = forwardRef(function LiquidButton(
  { className = '', children, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={`group relative overflow-hidden rounded-xl border border-cyan-300/60 bg-cyan-400/90 px-4 py-2.5 font-semibold text-[#03131a] shadow-[0_12px_30px_rgba(34,211,238,0.28)] backdrop-blur-xl transition-all duration-300 hover:border-cyan-200 hover:bg-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
      <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-white/15 opacity-100 transition-opacity duration-300" />
      <span className="pointer-events-none absolute inset-x-1/2 top-0 h-full w-0 -translate-x-1/2 bg-gradient-to-r from-transparent via-white/35 to-transparent transition-all duration-400 group-hover:inset-x-0 group-hover:w-full" />
    </button>
  );
});

export { LiquidButton };
