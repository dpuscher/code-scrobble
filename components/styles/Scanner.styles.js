import styled from 'styled-components';
import Spinner from '../layout/Spinner';

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

export const Loading = styled(Spinner)`
  width: 30%;
  height: 30%;
`;

export const LoadingWrapper = styled.div`
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;
