import styled from 'styled-components';
import ErrorIconSVG from '../../icons/ErrorIcon';

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

export const ErrorIcon = styled(ErrorIconSVG)`
  width: 30%;
  height: auto;
  margin-bottom: 15px;
`;

export const ErrorDescription = styled.div`
  margin: 10px 0;
`;

export const RetryButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-top: 10%;
  margin-bottom: -5%;
  padding: 5%;
  appearance: none;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
`;
