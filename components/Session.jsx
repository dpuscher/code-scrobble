import PropTypes from 'prop-types';
import React from 'react';
import Link from 'next/link';
import {
  Image, ImageAndUser, Loader, Menu, MenuItem, Username,
} from './styles/Session.styles';
import { autotrackParams } from '../lib/analytics';

class Session extends React.Component {
  state = {
    open: false,
  }

  handleClick = () => {
    this.setState(state => ({ open: !state.open }));
  }

  render() {
    const {
      data: {
        id, image, name, url,
      }, error,
    } = this.props;
    const { open } = this.state;
    if (error) return null;
    return (
      <>
        <ImageAndUser>
          <Username href={url} open={open}>{name}</Username>
          <Image image={image} onClick={this.handleClick}>
            {!id && <Loader />}
          </Image>
        </ImageAndUser>
        <Menu open={open}>
          <Link href="/logout" passHref>
            <MenuItem {...autotrackParams('Session', 'Logout')}>Logout</MenuItem>
          </Link>
        </Menu>
      </>
    );
  }
}

Session.propTypes = {
  data: PropTypes.object,
  error: PropTypes.string,
};

Session.defaultProps = {
  data: {},
  error: null,
};

export default Session;
