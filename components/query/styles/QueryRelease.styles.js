import { IoIosSearch } from 'react-icons/io';
import styled from 'styled-components';
import { Lazy } from 'react-lazy';
import LogoIcon from '../../icons/LogoIcon';
import { dark } from '../../../lib/colors';
import { buttonReset } from '../../../styles/mixins';

export const Wrapper = styled.div`
  position: relative;
  width: 500px;
  max-width: 80%;
  height: 100%;
  margin: 0 auto;
`;

export const Button = styled.button`
  position: absolute;
  z-index: 1;
  bottom: 0;
  left: 0;
  width: 15%;
  padding: 2.5%;
  appearance: none;
  transform: translateY(100%);
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
`;

export const Icon = styled(IoIosSearch)`
  width: 100%;
  height: auto;
`;

export const Overlay = styled.div`
  display: flex;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: auto;
  background: rgba(0,0,0,.7);
  backdrop-filter: blur(10px);
  -webkit-overflow-scrolling: touch;
`;

export const Content = styled.div`
  display: flex;
  position: relative;
  flex-direction: column;
  width: 100%;
  max-width: 600px;
  height: calc(100% - 60px);
  margin: 40px 20px 20px;
  padding: 20px;
  border-radius: 3px;
  background-color: #fff;
  color: ${dark};
`;

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

export const CloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  padding: 5px 0;
  appearance: none;
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
`;

export const Result = styled.a`
  display: flex;
  width: 100%;
  margin-bottom: 10px;
  color: ${dark};
  text-decoration: none;
`;

export const ThumbnailWrapper = styled(Lazy)`
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
