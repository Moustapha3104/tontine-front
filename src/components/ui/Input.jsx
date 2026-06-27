import { cn } from '../../lib/cn';

export default function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        'h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-[15px] text-white placeholder:text-white/35 outline-none backdrop-blur-xl transition leading-relaxed',
        'focus:border-violet-400/40 focus:bg-white/7',
        className
      )}
      {...props}
    />
  );
}

