import styled from 'styled-components';
import { dark } from '../../../lib/colors';
import { buttonReset } from '../../../styles/mixins';

// Anchors the round icon button that opens an overlay, below the logo row.
export const ToggleWrapper = styled.div`
  position: relative;
  width: 500px;
  max-width: 80%;
  height: 100%;
  margin: 0 auto;
`;

export const ToggleButton = styled.button`
  ${buttonReset}
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: 15%;
  padding: 2.5%;
  transform: translateY(100%);
  cursor: pointer;

  svg {
    width: 100%;
    height: auto;
  }
`;

export const Backdrop = styled.div`
  display: flex;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: rgba(0, 0, 0, .7);
  backdrop-filter: blur(10px);
`;

export const Content = styled.div<{ $fullHeight: boolean }>`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  ${({ $fullHeight }) => ($fullHeight ? 'height' : 'max-height')}: calc(100% - 60px);
  margin: 40px 20px 20px;
  padding: 20px;
  border-radius: 3px;
  background-color: #fff;
  color: ${dark};
`;

export const CloseButton = styled.button`
  ${buttonReset}
  position: absolute;
  top: -40px;
  right: 0;
  padding: 5px 0;
  cursor: pointer;
`;
