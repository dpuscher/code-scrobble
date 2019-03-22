import Router from 'next/router';
import { ChevronLeft } from 'styled-icons/boxicons-regular';
import { silver } from '../lib/colors';
import { Button } from './styles/BackButton.styles';

const getHostFromUrl = url => (
  (/\/\/([^/]+)\//i.exec(url) || [])[1]
);

const hasExternalReferrer = () => {
  if (!document.referrer) return true;
  return getHostFromUrl(document.referrer) !== getHostFromUrl(window.location.href);
};

const handleClick = () => {
  if (hasExternalReferrer()) {
    Router.push('/');
  } else {
    Router.back();
  }
};

const BackButton = () => (
  <Button onClick={handleClick}>
    <ChevronLeft color={silver} size="40" />
    Back
  </Button>
);

export default BackButton;
