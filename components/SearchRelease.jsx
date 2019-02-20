import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { FaLastfm } from 'react-icons/fa';
import { MdClose } from 'react-icons/md';
import { IoIosRefresh } from 'react-icons/io';
import { yellow } from '../lib/colors';
import { Error, ErrorIcon, RetryButton } from './styles/Error.styles';
import {
  Button, Loading, LoadingWrapper, Poster, PosterContent, PosterFallback,
} from './styles/SearchRelease.styles';

const SearchRelease = ({ code, onScrobble, onCancel }) => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState();
  const [loadingError, setLoadingError] = useState(false);

  const doRequest = async () => {
    setInitialized(true);
    setLoading(true);
    const response = await fetch(`/search/${code}`);
    const json = await response.json();
    if (!json.id) {
      setLoadingError(true);
    } else if (json.instantScrobble) {
      onScrobble(json);
    }
    setData(json);
    setLoading(false);
  };

  useEffect(() => { if (!initialized) doRequest(); });

  const scrobble = () => {
    onScrobble(data);
  };

  return (
    <>
      {loading && <LoadingWrapper><Loading size="300" /></LoadingWrapper>}
      {!loading && loadingError && (
        <Error>
          <ErrorIcon color={yellow} />
          <b>No release found <br />{code}</b>
          <RetryButton onClick={onCancel}>
            <IoIosRefresh size="30px" css="margin-bottom: 7px" />
            Retry
          </RetryButton>
        </Error>
      )}
      {!loading && !loadingError && (
        <Poster image={data.image}>
          <PosterContent>
            <Button onClick={onCancel}>
              <MdClose size="40px" css="margin-bottom: 10px" />
              Cancel
            </Button>
            <Button onClick={scrobble}>
              <FaLastfm size="40px" css="margin-bottom: 10px" />
              Scrobble
            </Button>
          </PosterContent>
          {!data.image && (
            <PosterFallback>
              <b>{data.artist}</b>
              <div>{data.title}</div>
            </PosterFallback>
          )}
        </Poster>
      )}
    </>
  );
};

SearchRelease.propTypes = {
  code: PropTypes.string.isRequired,
  onScrobble: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SearchRelease;
