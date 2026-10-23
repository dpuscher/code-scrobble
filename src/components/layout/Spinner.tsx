type Props = {
  className?: string;
};

/** Spinning ring in the accent color. */
const Spinner = ({ className = '' }: Props) => (
  <div
    role="status"
    aria-label="Loading"
    className={`inline-block animate-spinner rounded-full border-3 border-yellow/30 border-t-yellow ${className}`}
  />
);

/** A small spinner on its own line. */
export const InlineSpinner = () => <Spinner className="mx-auto my-[30px] block size-[30px]" />;

export default Spinner;
