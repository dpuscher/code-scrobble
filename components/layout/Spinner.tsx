import styled, { keyframes } from "styled-components";
import { yellow, yellowRGB } from "../../lib/colors";

export const animation = keyframes`
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div<{ size?: number | string }>`
  display: inline-block;
  width: ${props => props.size}px;
  height: ${props => props.size}px;
  animation: ${animation} 1s ease-in-out infinite;
  border: 3px solid rgba(${yellowRGB}, 0.3);
  border-radius: 50%;
  border-top-color: ${yellow};
`;

export default Spinner;
