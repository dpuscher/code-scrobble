import styled from 'styled-components';

export const Poster = styled.div`
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
  ${props => props.image && `background-image: url("${props.image}");`}
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
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  align-items: center;
  padding: 12% 0;
  appearance: none;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
`;
