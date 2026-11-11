import type { Part } from '../../lib/types';

type Props = {
  parts: Part[];
  selection: string[];
  onChange: (selection: string[]) => void;
};

const chipClass = [
  'h-8 min-w-8 flex-none rounded-full px-2.5 text-[14px] font-normal whitespace-nowrap tabular-nums',
  'transition-[background-color,color,box-shadow,scale] duration-150 ease-out active:scale-95',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow',
].join(' ');
const onClass = 'bg-yellow text-dark';
const offClass = 'bg-white/10 text-white/80 ring-1 ring-white/30 ring-inset hover:bg-white/20 hover:text-white';

const label = ({ kind, name, bonus }: Part) => `${kind === 'side' ? `Side ${name}` : name}${bonus ? ' (bonus)' : ''}`;

/** Toggles for the sides and discs to scrobble; bonus parts come after a divider. */
const PartPicker = ({ parts, selection, onChange }: Props) => {
  const toggle = (id: string) => onChange(
    selection.includes(id) ? selection.filter((other) => other !== id) : [...selection, id],
  );

  return (
    <div
      role="group"
      aria-label="Sides and discs to scrobble"
      className="flex w-full gap-2 overflow-x-auto px-[20%] pt-4 pb-1 [justify-content:safe_center] [scrollbar-width:none]"
    >
      {parts.map((part, i) => {
        const on = selection.includes(part.id);
        return (
          <div key={part.id} className="flex flex-none items-center gap-2">
            {part.bonus && !parts[i - 1]?.bonus && <span aria-hidden className="h-4 w-px bg-white/30" />}
            <button
              type="button"
              aria-pressed={on}
              aria-label={label(part)}
              onClick={() => toggle(part.id)}
              className={`${chipClass} ${on ? onClass : offClass}`}
            >
              {part.name}
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default PartPicker;
