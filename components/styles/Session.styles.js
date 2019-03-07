import styled, { css } from 'styled-components';
import { yellow, yellowRGB, dark } from '../../lib/colors';
import { animation } from '../layout/Spinner';

const fadeInOnOpen = css`
  transition: opacity .3s;
  opacity: 0;
  pointer-events:none;
  ${props => props.open && css`
    opacity: 1;
    pointer-events: auto;
  `}
`;

export const Image = styled.div`
  z-index: 1;
  width: 8vw;
  max-width: 50px;
  height: 8vw;
  max-height: 50px;
  border-radius: 50%;
  background-color: #ccc;
  background-size: cover;
  cursor: pointer;
  ${props => props.image && `background-image: url('${props.image}');`}
`;

export const Loader = styled.div`
  width: 100%;
  height: 100%;
  animation: ${animation} 1s ease-in-out infinite;
  border: 2px solid rgba(${yellowRGB}, .3);
  border-radius: 50%;
  border-top-color: ${yellow};
`;

export const Menu = styled.div`
  ${fadeInOnOpen}
  position: absolute;
  right: 0;
  margin-top: 8px;
  border-radius: 3px;
  background: white;
  color: ${dark};

  &:before {
    content: '';
    position: absolute;
    top: -6px;
    right: 4vw;
    width: 0px;
    height: 0px;
    transform: rotate(360deg) translateX(50%);
    border-width: 0 6px 6px 6px;
    border-style: solid;
    border-color: transparent transparent #fff transparent;
  }
`;

export const MenuItem = styled.a`
  display: block;
  padding: 10px 20px;
  color: ${dark};
  text-decoration: none;
  cursor: pointer;
`;

export const Username = styled.a`
  padding-right: 12px;
  font-size: 14px;
  text-decoration: none;
  ${fadeInOnOpen}
`;

export const ImageAndUser = styled.div`
  display: flex;
  align-items: center;
`;
