import styled, { css } from 'styled-components';

export const CoverBackground = styled.div<{ $image: string }>`
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  opacity: .5;
  background-size: cover;
  filter: blur(20px);
  ${({ $image }) => css`background-image: url("${$image}");`}
`;

export const Message = styled.div`
  margin: 30px 30px 0;
`;
