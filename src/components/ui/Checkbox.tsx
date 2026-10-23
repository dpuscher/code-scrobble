import type { ReactNode } from 'react';

type Props = {
  name: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  children?: ReactNode;
};

// Round box drawn with ::before, the check mark with ::after.
// Based on https://github.com/iceteabottle/css-checkbox
const box = [
  'before:absolute before:top-1/2 before:left-0 before:-mt-4 before:box-content before:size-[30px]',
  'before:rounded-full before:border before:border-silver before:bg-white/10 before:text-center',
  'before:transition-[background-color,border-color] before:duration-200 before:ease-[ease]',
  'peer-checked:before:animate-pulse-ring peer-checked:before:border-yellow peer-checked:before:bg-yellow',
  'peer-active:before:duration-0',
  'peer-focus-visible:before:outline-2 peer-focus-visible:before:outline-offset-2 peer-focus-visible:before:outline-yellow',
].join(' ');
const checkMark = [
  'after:absolute after:top-1/2 after:left-[9px] after:box-content after:h-[5px] after:w-[11px]',
  'after:-translate-y-[5px] after:-rotate-45 after:scale-0 after:border-b-3 after:border-l-3 after:border-dark',
  'after:transition-transform after:duration-200 after:ease-out peer-checked:after:scale-100',
].join(' ');

/** A native checkbox with a custom round look. */
const Checkbox = ({
  name, checked = false, disabled = false, onChange, children,
}: Props) => (
  <div className="flex items-center justify-center">
    <input
      name={name}
      id={`checkbox-${name}`}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.checked)}
      className="peer sr-only"
    />
    <label
      htmlFor={`checkbox-${name}`}
      className={`relative inline-flex h-8 cursor-pointer items-center pr-1.5 pl-[42px] select-none ${box} ${checkMark}`}
    >
      {children}
    </label>
  </div>
);

export default Checkbox;
