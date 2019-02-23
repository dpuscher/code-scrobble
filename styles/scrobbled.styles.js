import styled from 'styled-components';

// eslint-disable-next-line import/prefer-default-export
export const CoverBackground = styled.div`
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  opacity: .5;
  background-size: cover;
  filter: blur(20px);
  ${props => props.image && `background-image: url('${props.image}');`}
`;
