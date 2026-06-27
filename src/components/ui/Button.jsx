import { cn } from '../../lib/cn';

export default function Button({
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  type = 'button',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950 disabled:opacity-60 disabled:pointer-events-none';

  const variants = {
    primary:
      'bg-white text-ink-950 hover:bg-white/95 active:bg-white/90 shadow-[0_18px_60px_rgba(0,0,0,.35)]',
    glass:
      'bg-white/8 text-white border border-white/12 hover:bg-white/10 active:bg-white/8 backdrop-blur-xl',
    subtle:
      'bg-ink-850 text-white border border-white/10 hover:bg-ink-800 active:bg-ink-850',
    danger: 'bg-red-500/90 text-white hover:bg-red-500 active:bg-red-500/90',
  };

  const sizes = {
    sm: 'h-10 px-4 text-sm',
    md: 'h-12 px-5 text-sm',
    lg: 'h-14 px-6 text-base',
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}

