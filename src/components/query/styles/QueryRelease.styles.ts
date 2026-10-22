import styled from 'styled-components';
import LogoIcon from '../../icons/LogoIcon';
import { dark } from '../../../lib/colors';
import { buttonReset } from '../../../styles/mixins';

export const HeadWrapper = styled.form`
  position: relative;
  flex: 0 0 38px;
  height: 38px;
  margin: -20px -20px 0;
  overflow: hidden;
  border-bottom: 1px solid ${dark};
`;

export const Input = styled.input`
  width: 100%;
  margin: 0;
  padding: 10px 45px 10px 10px;
  border: 0;
  border-radius: 3px;
  box-shadow: none;
  font-size: 16px;
  line-height: 1;
  text-align: center;
`;

export const Submit = styled.button`
  ${buttonReset}
  display: flex;
  position: absolute;
  top: 0;
  right: 0;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 38px;
`;

export const ResultWrapper = styled.div`
  padding: 10px 0 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

export const Result = styled.a`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  color: ${dark};
  text-decoration: none;
`;

export const ThumbnailWrapper = styled.div`
  display: block;
  flex: 0 0 60px;
  width: 60px;
  height: 60px;
  margin-right: 10px;
`;

export const Thumbnail = styled.img`
  width: 60px;
  height: 60px;
  object-fit: cover;
`;

export const ResultInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

export const Title = styled.div`
  max-height: 2.3em;
  overflow: hidden;
  font-weight: 600;
`;

export const Meta = styled.div`
  height: 1.15em;
  margin-top: 8px;
  overflow: hidden;
  font-size: 13px;
`;

export const FallbackWrapper = styled.div`
  display: flex;
  flex: 1 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const FallbackIcon = styled(LogoIcon)`
  width: 50%;
  height: auto;
`;

export const LoadingWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 0;
  padding-bottom: 100%;
`;

export const NoResults = styled.div`
  text-align: center;

  svg {
    display: block;
    margin: 0 auto 20px;
  }
`;
