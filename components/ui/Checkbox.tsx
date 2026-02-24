import React from "react";

import { Input, Label, Wrapper } from "./styles/Checkbox.styles";

interface CheckboxProps {
  checked?: boolean;
  className?: string | null;
  name: string;
  children?: React.ReactNode;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

class Checkbox extends React.Component<CheckboxProps, {}> {
  label: any;

  constructor(props: CheckboxProps) {
    super(props);
    this.handleCheck = this.handleCheck.bind(this);
  }

  shouldComponentUpdate(nextProps: CheckboxProps) {
    // eslint-disable-next-line react/destructuring-assignment
    return ["checked", "disabled"].some(prop => this.props[prop] !== nextProps[prop]);
  }

  handleCheck(event) {
    const { onChange = () => {} } = this.props;
    onChange(event.target.checked);
  }

  render() {
    const { name, className = null, checked = false, disabled = false, children = null } = this.props;
    const id = `checkbox-${name}`;

    return (
      <Wrapper className={className} role="checkbox" aria-checked={!!checked} tabIndex={0}>
        <Input
          name={name}
          id={id}
          type="checkbox"
          checked={!!checked}
          onChange={this.handleCheck}
          disabled={disabled}
        />
        <Label
          htmlFor={id}
          ref={e => {
            this.label = e;
          }}
        >
          {children}
        </Label>
      </Wrapper>
    );
  }
}

export default Checkbox;
