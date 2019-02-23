import styled from 'styled-components';

// eslint-disable-next-line import/prefer-default-export
export const Camera = styled.div`
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  position: absolute;
  width: 100%;
  height: 100%;
  transform: translate3d(0, 0, 0);

  video, canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;
