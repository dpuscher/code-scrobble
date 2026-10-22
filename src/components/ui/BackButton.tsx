import Router from 'next/router';
import { BiChevronLeft } from 'react-icons/bi';
import { silver } from '../../lib/colors';
import { Button } from './styles/BackButton.styles';

// Go back within the app, but never "back" to another site.
function handleClick() {
  const cameFromApp = document.referrer
    && new URL(document.referrer).host === window.location.host;
  if (cameFromApp && window.history.length > 1) Router.back();
  else Router.push('/');
}

const BackButton = () => (
  <Button type="button" onClick={handleClick}>
    <BiChevronLeft color={silver} size="40" aria-hidden />
    Back
  </Button>
);

export default BackButton;
