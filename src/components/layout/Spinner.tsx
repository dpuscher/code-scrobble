import styled, { keyframes } from 'styled-components';
import { yellow, yellowRGB } from '../../lib/colors';

export const animation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div.attrs({ role: 'status', 'aria-label': 'Loading' })<{ $size?: number }>`
  display: inline-block;
  width: ${({ $size }) => ($size ? `${$size}px` : 'auto')};
  height: ${({ $size }) => ($size ? `${$size}px` : 'auto')};
  animation: ${animation} 1s ease-in-out infinite;
  border: 3px solid rgba(${yellowRGB}, .3);
  border-radius: 50%;
  border-top-color: ${yellow};
`;

export const InlineSpinner = styled(Spinner).attrs({ $size: 30 })`
  display: block;
  margin: 30px auto;
`;

export default Spinner;
