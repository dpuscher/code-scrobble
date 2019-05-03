import React from 'react';
import PropTypes from 'prop-types';

import { Input, Label, Wrapper } from './styles/Checkbox.styles';

class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.handleCheck = this.handleCheck.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    // eslint-disable-next-line react/destructuring-assignment
    return ['checked', 'disabled'].some(prop => this.props[prop] !== nextProps[prop]);
  }

  handleCheck(event) {
    const { onChange } = this.props;
    onChange(event.target.checked);
  }

  render() {
    const {
      name, className, checked, disabled, children,
    } = this.props;
    const id = `checkbox-${name}`;

    return (
      <Wrapper
        className={className}
        role="checkbox"
        aria-checked={!!checked}
        tabIndex={0}
      >
        <Input
          name={name}
          id={id}
          type="checkbox"
          checked={!!checked}
          onChange={this.handleCheck}
          disabled={disabled}
        />
        <Label htmlFor={id} ref={(e) => { this.label = e; }}>
          {children}
        </Label>
      </Wrapper>
    );
  }
}

Checkbox.propTypes = {
  checked: PropTypes.bool,
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  children: PropTypes.any,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
};

Checkbox.defaultProps = {
  checked: false,
  className: null,
  children: null,
  onChange: () => {},
  disabled: false,
};

export default Checkbox;
