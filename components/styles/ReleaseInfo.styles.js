import { IoIosInformationCircleOutline } from 'react-icons/io';
import styled from 'styled-components';
import { dark } from '../../lib/colors';

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

export const Icon = styled(IoIosInformationCircleOutline)`
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
  max-height: calc(100% - 60px);
  margin: 40px 20px 20px;
  padding: 20px;
  border-radius: 3px;
  background-color: #fff;
  color: ${dark};
`;

export const HeadWrapper = styled.div`
  flex: 0 0;
  margin: -20px -20px 0;
  overflow: hidden;
`;

export const Head = styled.div`
  position: relative;
  margin: -5px -5px 0;
  overflow: hidden;
`;

export const Cover = styled.img`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px);
  opacity: .4;
`;

export const Meta = styled.div`
  position: relative;
  z-index: 1;
  flex: 1 1;
  padding: 20px;
  font-size: 25px;
`;

export const Title = styled.div`
  margin-bottom: 8px;
  font-size: 1em;
  font-weight: bold;
`;

export const Year = styled.div`
  font-size: .5em;
`;

export const Artist = styled.div`
  margin-bottom: 8px;
  font-size: .8em;
`;

export const Gradient = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 25px;
  background: linear-gradient(transparent, #fff);
`;

export const TrackListWrapper = styled.div`
  padding: 10px 0 0;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
`;

export const TrackNumber = styled.td`
  width: 0;
  white-space: nowrap;
`;

export const TrackTitle = styled.td`
  width: 100%;
`;

export const TrackDuration = styled.td`
  width: 0;
  white-space: nowrap;
`;

export const ExternalButton = styled.a`
  width: 100%;
  padding: 7px;
  margin-top: 10px;
  border: 2px solid ${dark};
  color: inherit;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
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
