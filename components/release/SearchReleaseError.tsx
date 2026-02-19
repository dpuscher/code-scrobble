import PropTypes from 'prop-types';
import React from 'react';
import { IoIosRefresh } from 'react-icons/io';
import { yellow } from '../../lib/colors';
import { FlexContent } from '../../styles/layout.styles';
import { ErrorIcon, RetryButton } from '../layout/styles/Error.styles';

const SearchReleaseError = ({ code, onRetry }) => (
  <FlexContent>
    <ErrorIcon color={yellow} />
    <b>No release found<br />{code}</b>
    <RetryButton onClick={onRetry}>
      <IoIosRefresh size="30px" css="margin-bottom: 7px" />
      Retry
    </RetryButton>
  </FlexContent>
);

SearchReleaseError.propTypes = {
  code: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
};

export default SearchReleaseError;
