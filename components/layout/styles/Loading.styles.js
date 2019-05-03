import styled from 'styled-components';
import Spinner from '../Spinner';

export const LoadingWrapper = styled.div`
  display: flex;
  position: absolute;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export const LoadingSpinner = styled(Spinner)`
  width: 30%;
  height: 30%;
`;
