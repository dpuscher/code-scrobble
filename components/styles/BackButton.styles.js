import styled from 'styled-components';
import { silver } from '../../lib/colors';
import { buttonReset } from '../../styles/mixins';

// eslint-disable-next-line import/prefer-default-export
export const Button = styled.button`
  ${buttonReset}
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  align-items: center;
  width: 100%;
  padding: 15px;
  overflow: hidden;
  border-bottom: 1px solid ${silver};
  background: rgba(0, 0, 0, .6);
  box-shadow: 0 0 3px 2px black;
  backdrop-filter: blur(5px);
  font-size: 16px;
  cursor: pointer;
`;
