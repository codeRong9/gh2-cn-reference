export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="rgb(var(--accent))" />
      <path d="M8 11.5h5.5M8 20.5h5.5" stroke="rgb(var(--accent-ink))" strokeWidth="2" strokeLinecap="round" />
      <path d="M18.5 11.5H24M18.5 20.5H24" stroke="rgb(var(--accent-ink))" strokeWidth="2" strokeLinecap="round" />
      <rect x="13.5" y="8" width="5" height="16" rx="1.6" stroke="rgb(var(--accent-ink))" strokeWidth="1.8" />
    </svg>
  );
}
