import Router from 'next/router';
import { IoIosArrowBack } from 'react-icons/io';
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
    <IoIosArrowBack css="margin-right: 7px" color={silver} size="25px" />
    Back
  </Button>
);

export default BackButton;
