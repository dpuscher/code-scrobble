import type { ReactNode } from 'react';
import { Input, Label, Wrapper } from './styles/Checkbox.styles';

type Props = {
  name: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  children?: ReactNode;
};

/** A native checkbox with a custom round look. */
const Checkbox = ({
  name, checked = false, disabled = false, onChange, children,
}: Props) => (
  <Wrapper>
    <Input
      name={name}
      id={`checkbox-${name}`}
      type="checkbox"
      checked={checked}
      disabled={disabled}
      onChange={(event) => onChange?.(event.target.checked)}
    />
    <Label htmlFor={`checkbox-${name}`}>
      {children}
    </Label>
  </Wrapper>
);

export default Checkbox;
