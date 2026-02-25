import React from "react";

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
      <div
        className={`flex items-center justify-center outline-none ${className ?? ""}`}
        role="checkbox"
        aria-checked={!!checked}
        tabIndex={0}
      >
        <input
          className="checkbox-input absolute w-px h-px m-[-1px] p-0 overflow-hidden clip-[rect(0_0_0_0)] border-0"
          name={name}
          id={id}
          type="checkbox"
          checked={!!checked}
          onChange={this.handleCheck}
          disabled={disabled}
        />
        <label
          className="checkbox-label"
          htmlFor={id}
          ref={e => {
            this.label = e;
          }}
        >
          {children}
        </label>
      </div>
    );
  }
}

export default Checkbox;
