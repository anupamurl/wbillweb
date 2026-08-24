type Props = {
  size?: number;
  className?: string;
  /** Draw the rounded brand tile behind the mark, as on the app icon. */
  tile?: boolean;
};

/**
 * The wbill mark. Geometry mirrors brand/mark.json; brand/mark.test.mjs
 * fails if this file drifts from it.
 */
export default function WbillMark({ size = 32, className, tile = true }: Props) {
  const d = 'M3 9L7.75 17.5L12 9.5L16.25 17.5L21 6.5';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="wbill"
    >
      {tile && <rect width="24" height="24" rx="5.4" fill="var(--wbill-primary)" />}
      <g transform={tile ? 'translate(12 12) scale(0.72) translate(-12 -12)' : undefined}>
        <path
          d={d}
          fill="none"
          stroke={tile ? '#FFFFFF' : 'currentColor'}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
}
