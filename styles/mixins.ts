import { css } from 'styled-components';

// eslint-disable-next-line import/prefer-default-export
export const buttonReset = css`
  width: auto;
  margin: 0;
  padding: 0;
  overflow: visible;
  border: none;
  background: transparent;
  color: inherit;
  font: inherit;
  -webkit-font-smoothing: inherit;
  -moz-osx-font-smoothing: inherit;
  appearance: none;
  line-height: normal;

  &::-moz-focus-inner {
    padding: 0;
    border: 0;
  }
`;

export const ulReset = css`
  margin: 0;
  padding: 0;
  list-style-type: none;
`;

export const liReset = css`
  display: block;
`;
