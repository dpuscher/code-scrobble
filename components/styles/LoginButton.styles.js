import styled from 'styled-components';

export const Wrapper = styled.a`
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10px 25px;
  border: 1px solid #9f0c05;
  border-radius: 5px;
  background: #d51007;
  color: #fff;
  font-size: 13px;
  text-decoration: none;
  transition: .25s;
  transition-property: box-shadow, transform;
  box-shadow: 0px 2px 0px #9f0c05;

  &:active {
    transform: translateY(3px);
    box-shadow: none
  }
`;

export const Caption = styled.span`
  margin-bottom: 5px;
`;
