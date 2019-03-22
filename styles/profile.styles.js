import TimeAgo from 'react-timeago';
import styled, { css } from 'styled-components';
import { grey, silver } from '../lib/colors';
import { liReset, ulReset, buttonReset } from './mixins';

export const Wrapper = styled.div`
  width: 100%;
  max-width: 768px;
  margin: auto;
  padding: 72px 20px 20px;
  line-height: 1.4;
  word-wrap: break-word;
`;

export const H1 = styled.h1`
  margin: 0 0 20px;
`;

export const Header = styled.header`
  display: flex;
  align-items: center;
`;

export const ProfileImg = styled.img`
  flex: 0 0 87px;
  width: 87px;
  height: 87px;
  border-radius: 50%;
`;

export const H2 = styled.h2`
  margin: 0;
  padding-left: 30px;
`;

export const H3 = styled.h3`
  margin: 25px 0 15px;
`;

export const List = styled.ul`
  ${ulReset}
  margin: 0 -20px;
`;

export const ListItem = styled.li`
  ${liReset}
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-top: 1px solid ${grey};

  &:last-child {
    border-bottom: 1px solid ${grey};
  }
`;

export const ListCaption = styled.span`
  flex-grow: 1;
  padding: 10px 0;
  transition: opacity .3s;
  text-decoration: none;
  ${props => props.disabled && css`
    opacity: .3;
  `}
`;

export const DeleteButton = styled.button`
  ${buttonReset}
  position: relative;
  right: -20px;
  padding: 15px;
  transition: opacity .3s;
  ${props => props.disabled && css`
    opacity: .3;
  `}
`;

export const Fallback = styled.div`
  padding: 10px 40px;
  opacity: .5;
  color: ${silver};
  font-style: italic;
  text-align: center;
`;

export const Meta = styled.div`
  margin: 15px 0;
  font-size: .8em;
`;

export const Time = styled(TimeAgo)`
  display: inline-block;
  opacity: .5;
  font-size: 12px;
  white-space: nowrap;
`;
