type LogoProps = {
  className?: string;
  title?: string;
  compact?: boolean;
};

/** AlphaIO wordmark / mark from frontend SiteLogo. */
export function Logo({
  className,
  title = 'AlphaIO',
  compact = false,
}: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={compact ? '0 0 300 360' : '0 0 1200 360'}
      role="img"
      aria-label={title}
      className={['alphaio-logo', className].filter(Boolean).join(' ')}
    >
      <g>
        <g transform="translate(0 -7.6) scale(1 1.1)">
          <path
            fill="var(--logo-primary)"
            fillRule="evenodd"
            d="M38 278 123 76h50l85 202h-53l-20-51h-76l-20 51Zm88-94h42l-21-57Z"
          />
          <path
            fill="none"
            stroke="var(--logo-accent)"
            strokeWidth="22"
            strokeLinecap="round"
            d="M71 211h105"
          />
        </g>
        <circle fill="var(--logo-accent)" cx="148" cy="39" r="22" />
      </g>
      {!compact && (
        <g>
          <path
            fill="none"
            stroke="var(--logo-primary)"
            strokeWidth="40"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M287 94v184M361 164v163m2-112c0-39 27-64 65-64 41 0 66 26 66 64s-25 64-66 64c-38 0-65-25-65-64ZM546 94v184m0-72c0-35 24-55 58-55 36 0 57 22 57 58v69M733 215c0-38 26-64 65-64 40 0 66 26 66 64s-26 64-66 64c-39 0-65-26-65-64Zm131-54v117"
          />
          <g
            fill="none"
            stroke="var(--logo-accent)"
            strokeWidth="40"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M932 106v172" />
            <path d="M1020 145a80 80 0 1 1 0 84" />
          </g>
        </g>
      )}
    </svg>
  );
}
