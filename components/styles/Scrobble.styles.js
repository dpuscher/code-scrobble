import styled from 'styled-components';
import Spinner from '../layout/Spinner';

export const Loading = styled(Spinner)`
  width: 100%;
  height: 100%;
`;

export const LoadingWrapper = styled.div`
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-size: cover;
  ${props => props.image && `background-image: url("${props.image}");`}
`;

export const LoadingContent = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 12% 20%;
  background: rgba(0, 0, 0, .5);
  text-align: center;
  backdrop-filter: blur(10px);
  text-shadow: 0 0 3px black, 0 0 3px black, 0 0 3px black;
`;
