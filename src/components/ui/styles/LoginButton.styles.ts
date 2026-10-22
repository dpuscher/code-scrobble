import styled from 'styled-components';
import { lastFm, lastFmDark } from '../../../lib/colors';

export const Wrapper = styled.a`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 25px;
  transition: .25s;
  transition-property: box-shadow, transform;
  border: 1px solid ${lastFmDark};
  border-radius: 5px;
  background: ${lastFm};
  box-shadow: 0px 2px 0px ${lastFmDark};
  color: #fff;
  font-size: 13px;
  text-decoration: none;

  &:active {
    transform: translateY(3px);
    box-shadow: none
  }
`;

export const Caption = styled.span`
  margin-bottom: 5px;
`;
