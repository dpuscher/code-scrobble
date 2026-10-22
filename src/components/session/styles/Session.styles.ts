import styled, { css } from 'styled-components';
import { dark } from '../../../lib/colors';
import { buttonReset } from '../../../styles/mixins';

const fadeInOnOpen = css<{ $open: boolean }>`
  transition: opacity .3s;
  opacity: 0;
  pointer-events: none;
  ${({ $open }) => $open && css`
    opacity: 1;
    pointer-events: auto;
  `}
`;

export const Avatar = styled.button<{ $image: string | null }>`
  ${buttonReset}
  z-index: 1;
  width: 8vw;
  max-width: 50px;
  height: 8vw;
  max-height: 50px;
  border-radius: 50%;
  background-color: #ccc;
  background-size: cover;
  cursor: pointer;
  ${({ $image }) => $image && css`background-image: url("${$image}");`}
`;

export const Arrow = styled.div<{ $open: boolean }>`
  ${fadeInOnOpen}
  position: absolute;
  right: 0;
  width: 8vw;
  max-width: 50px;
  height: 8px;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    width: 0;
    height: 0;
    transform: translate(-50%, 2px);
    border-width: 0 6px 6px 6px;
    border-style: solid;
    border-color: transparent transparent #fff transparent;
  }
`;

export const Menu = styled.div<{ $open: boolean }>`
  ${fadeInOnOpen}
  position: absolute;
  right: 0;
  margin-top: 8px;
  border-radius: 3px;
  background: white;
  color: ${dark};
  text-align: right;

  &[hidden] {
    display: block;
    visibility: hidden;
  }
`;

export const MenuItem = styled.button`
  ${buttonReset}
  display: block;
  width: 100%;
  padding: 10px 20px;
  color: ${dark};
  text-align: right;
  text-decoration: none;
  cursor: pointer;
`;

export const Username = styled.a<{ $open: boolean }>`
  padding-right: 12px;
  font-size: 14px;
  text-decoration: none;
  ${fadeInOnOpen}
`;

export const AvatarAndUser = styled.div`
  display: flex;
  align-items: center;
`;
