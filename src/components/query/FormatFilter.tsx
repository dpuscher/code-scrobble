import { SEARCH_FORMATS, type SearchFormat } from '../../lib/formats';

const OPTIONS = [null, ...SEARCH_FORMATS];
// Literal class names, so Tailwind generates them.
const INDICATOR_POSITION = ['translate-x-0', 'translate-x-full', 'translate-x-[200%]', 'translate-x-[300%]'];

type Props = {
  value: SearchFormat | null;
  onChange: (format: SearchFormat | null) => void;
};

/** Segmented control narrowing the search to one format; native radios for keyboard use. */
const FormatFilter = ({ value, onChange }: Props) => (
  <fieldset className="relative grid grid-cols-4 rounded-[10px] bg-black/[0.06] p-0.5">
    <legend className="sr-only">Format</legend>
    <span
      aria-hidden
      className={`absolute inset-y-0.5 left-0.5 w-[calc((100%-4px)/4)] rounded-lg bg-white shadow-[0_1px_3px_rgb(0_0_0/0.12)] transition-transform duration-200 ease-out-strong motion-reduce:transition-none ${INDICATOR_POSITION[OPTIONS.indexOf(value)]}`}
    />
    {OPTIONS.map((format) => (
      <label
        key={format ?? 'all'}
        className="relative flex h-8 cursor-pointer items-center justify-center rounded-lg text-[13px] font-medium text-dark/55 transition-colors duration-150 has-checked:text-dark has-focus-visible:outline-2 has-focus-visible:outline-dark/60"
      >
        <input
          type="radio"
          name="format"
          checked={value === format}
          onChange={() => onChange(format)}
          className="sr-only"
        />
        {format ?? 'All'}
      </label>
    ))}
  </fieldset>
);

export default FormatFilter;
