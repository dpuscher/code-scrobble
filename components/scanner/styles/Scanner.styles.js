import styled from 'styled-components';
import { grey } from '../../../lib/colors';
import ErrorIconSVG from '../../icons/ErrorIcon';
import Spinner from '../../layout/Spinner';

export const ErrorIcon = styled(ErrorIconSVG)`
  width: 30%;
  height: auto;
  margin-bottom: 15px;
`;

export const ErrorDescription = styled.div`
  margin: 10px 0;
`;

export const Camera = styled.div`
  visibility: ${props => (props.visible ? 'visible' : 'hidden')};
  position: absolute;
  width: 100%;
  height: 100%;

video, canvas {
  width: 100%;
  height: 100%;
}
`;

export const Wrapper = styled.div`
  position: relative;
  width: 600px;
  max-width: 80%;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%;
  background: ${grey};
`;

export const HeightWrapper = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 100%;
`;

export const Error = styled.div`
  display: flex;
  position: absolute;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 10%;
  text-align: center;
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
