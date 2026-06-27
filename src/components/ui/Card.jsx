import { cn } from '../../lib/cn';

export default function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-white/10 bg-white/5 shadow-card backdrop-blur-xl',
        className
      )}
      {...props}
    />
  );
}

