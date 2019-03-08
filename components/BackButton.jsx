import Router from 'next/router';
import { IoIosArrowBack } from 'react-icons/io';
import { silver } from '../lib/colors';
import { Button } from './styles/BackButton.styles';

const BackButton = () => {
  const handleClick = () => Router.back();

  return (
    <Button onClick={handleClick}>
      <IoIosArrowBack css="margin-right: 7px" color={silver} size="25px" />
      Back
    </Button>
  );
};

export default BackButton;
