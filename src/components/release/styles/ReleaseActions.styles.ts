import styled, { css } from 'styled-components';
import { buttonReset } from '../../../styles/mixins';

export const Poster = styled.div<{ $image: string | null }>`
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  height: 100%;
  background-size: cover;
  ${({ $image }) => $image && css`background-image: url("${$image}");`}
`;

export const PosterContent = styled.div`
  display: flex;
  width: 100%;
  padding: 0 20%;
  background: rgba(0, 0, 0, .5);
  text-align: center;
  backdrop-filter: blur(10px);
`;

export const Button = styled.button`
  ${buttonReset}
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  padding: 12% 0;
  cursor: pointer;

  svg {
    margin-bottom: 10px;
  }
`;
