import React, { useState } from 'react';
import Scanner from '../components/Scanner';
import SearchRelease from '../components/SearchRelease';
import Layout from '../components/layout/Layout';
import { Center } from '../styles/layout.styles';
import { Wrapper, HeightWrapper } from '../styles/scan.styles';
import Scrobble from '../components/Scrobble';

const Scan = () => {
  const [status, setStatus] = useState('scan');
  const [code, setCode] = useState();
  const [data, setData] = useState();

  const codeDetected = ({ codeResult: { code: barcode } }) => {
    setCode(barcode);
    setStatus('detected');
  };

  const reScan = () => {
    setStatus('scan');
    setCode(null);
    setData(null);
  };

  const scrobble = (scrobbleData) => {
    setData(scrobbleData);
    setStatus('scrobble');
  };

  return (
    <Layout>
      <Center>
        <Wrapper>
          <HeightWrapper>
            {status === 'scan' && <Scanner onDetected={codeDetected} />}
            {status === 'detected' && <SearchRelease code={code} onScrobble={scrobble} onCancel={reScan} />}
            {status === 'scrobble' && <Scrobble data={data} onRetry={reScan} />}
          </HeightWrapper>
        </Wrapper>
      </Center>
    </Layout>
  );
};

export default Scan;
