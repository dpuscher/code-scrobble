import PropTypes from 'prop-types';
import React from 'react';
import { IoIosRefresh } from 'react-icons/io';
import { yellow } from '../../lib/colors';
import { FlexContent } from '../../styles/layout.styles';
import { ErrorIcon, RetryButton } from '../layout/styles/Error.styles';

const ScrobbleError = ({ onRetry }) => (
  <FlexContent>
    <ErrorIcon color={yellow} />
    <b>An error occured while sending data to Last.fm</b>
    <RetryButton onClick={onRetry}>
      <IoIosRefresh size="30px" css="margin-bottom: 7px" />
      Retry
    </RetryButton>
  </FlexContent>
);

ScrobbleError.propTypes = {
  onRetry: PropTypes.func.isRequired,
};

export default ScrobbleError;
