// Source: https://github.com/iceteabottle/css-checkbox
import styled, { keyframes } from 'styled-components';
import { silver, yellow, dark } from '../../lib/colors';

// custom checkbox/radios
const inputHeight = 30;
const inputWidth = 30;
const inputBorderWidth = 1;

const checkboxColor = yellow;
const borderColor = silver;

const borderscale1 = keyframes`
  50% {
    box-shadow: 0 0 0 2px ${checkboxColor};
  }
`;

export const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
`;

export const Label = styled.label`
  display: inline-flex;
  position: relative;
  align-items: center;
  height: ${inputHeight + (2 * inputBorderWidth)}px;
  padding: 0 6px 0 42px;
  cursor: pointer;
  user-select: none;

  &:before {
    top: 50%;
    left: 0;
    width: ${inputWidth}px;
    height: ${inputHeight}px;
    margin-top: ${-(inputHeight / 2 + inputBorderWidth)}px;
    transition: .2s ease;
    transition-property: background-color, border-color;
    border: ${inputBorderWidth}px solid ${borderColor};
    border-radius: 50%;
    background: rgba(255, 255, 255, .1);
    text-align: center;
  }

  &:after{
    top: 50%;
    left: 9px;
    width: 11px;
    height: 5px;
    margin-top: 0;
    transform: translateY(-5px) rotate(-45deg) scale(0);
    transform-origin: 50%;
    transition: transform .2s ease-out;
    border-width: 0 0 3px 3px;
    border-style: solid;
    border-color: ${dark};
    background-color: transparent;
    border-image: none;
  }

  &:before,
  &:after{
    content: '';
    position: absolute;
    box-sizing: content-box;
  }
`;

export const Input = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  border: 0;

  &:active {
    & + ${Label} {
      &:before {
        transition-duration: 0s;
      }
    }
  }

  &:checked {
    & + ${Label} {
      &:after {
        content: '';
        transform: translateY(-5px) rotate(-45deg) scale(1);
        transition: transform .2s ease-out;
        border-color: ${dark};
      }
      &:before {
        animation: ${borderscale1} .2s ease-in;
        border-color: ${checkboxColor};
        background: ${checkboxColor};
      }
    }
  }
`;
