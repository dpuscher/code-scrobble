import styled from 'styled-components';
import { grey } from '../lib/colors';

export const Wrapper = styled.div`
  position: relative;
  width: 600px;
  max-width: 80%;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 50%;
  background: ${grey};
  mask-image: radial-gradient(white, black);
`;

export const HeightWrapper = styled.div`
  width: 100%;
  height: 0;
  padding-bottom: 100%;
`;
