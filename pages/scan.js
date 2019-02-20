import React, { useState } from 'react';
import Scanner from '../components/Scanner';
import SearchRelease from '../components/SearchRelease';
import Layout from '../components/layout/Layout';
import { Center } from '../styles/layout.styles';
import {
  Content, Footer, FooterContent, Header, HeightWrapper, Wrapper,
} from '../styles/scan.styles';
import Scrobble from '../components/Scrobble';
import Checkbox from '../components/Checkbox';

const Scan = () => {
  const [status, setStatus] = useState('scan');
  const [code, setCode] = useState();
  const [data, setData] = useState();
  const [autoScrobble, setAutoScrobble] = useState(false);

  const codeDetected = ({ codeResult: { code: barcode } }) => {
    setCode(barcode);
    setStatus('detected');
  };

  const reScan = () => {
    setStatus('scan');
    setCode(null);
    setData(null);
    setAutoScrobble(false);
  };

  const scrobble = (scrobbleData) => {
    setData(scrobbleData);
    setStatus('scrobble');
  };

  return (
    <Layout>
      <Center>
        <Wrapper>
          <Header />
          <Content>
            <HeightWrapper>
              {status === 'scan' && <Scanner onDetected={codeDetected} />}
              {status === 'detected' && <SearchRelease code={code} onScrobble={scrobble} onCancel={reScan} />}
              {status === 'scrobble' && <Scrobble data={data} autoScrobble={autoScrobble} onRetry={reScan} />}
            </HeightWrapper>
          </Content>
          <Footer>
            <FooterContent>
              {status === 'detected'
                && <Checkbox name="autoScrobble" checked={autoScrobble} onChange={setAutoScrobble}>Auto-scrobble on next scan</Checkbox>
              }
            </FooterContent>
          </Footer>
        </Wrapper>
      </Center>
    </Layout>
  );
};

export default Scan;
