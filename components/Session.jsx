import PropTypes from 'prop-types';
import React from 'react';
import Link from 'next/link';
import {
  Arrow, Image, ImageAndUser, Loader, Menu, MenuItem, Username,
} from './styles/Session.styles';
import targetBlank from '../lib/targetBlank';
import { autotrackParams } from '../lib/analytics';

class Session extends React.Component {
  overlayRef = React.createRef();

  state = {
    open: false,
  }

  componentDidMount() {
    document.addEventListener('click', this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    const { open } = this.state;
    const ref = this.overlayRef.current;

    if (open && !ref.contains(event.target) && document.body.contains(event.target)) {
      this.setState({ open: false });
    }
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
      <div ref={this.overlayRef}>
        <ImageAndUser>
          <Username href={url} open={open} {...targetBlank}>{name}</Username>
          <Image image={image} onClick={this.handleClick}>
            {!id && <Loader />}
          </Image>
        </ImageAndUser>
        <Arrow open={open} />
        <Menu open={open}>
          <Link href="/logout" passHref>
            <MenuItem {...autotrackParams('Session', 'Logout')}>Logout</MenuItem>
          </Link>
        </Menu>
      </div>
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
