interface SpinnerProps {
  size?: number | string;
  className?: string;
}

export default function Spinner({ size, className = "" }: SpinnerProps) {
  return (
    <div
      className={`inline-block rounded-full border-[3px] border-[rgba(254,218,106,0.3)] border-t-yellow animate-spin-ease ${className}`}
      style={size !== undefined ? { width: size, height: size } : undefined}
    />
  );
}
