import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { fetchSessionIfNeeded, getSessionState } from '../app/states/SessionState';
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
    this.props.fetchSessionIfNeeded();
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
      session: {
        data, error,
      },
    } = this.props;

    const { open } = this.state;
    if (error) return null;
    return (
      <div ref={this.overlayRef}>
        <Head>
          <link rel="preconnect" href="https://lastfm-img2.akamaized.net" />
        </Head>
        <ImageAndUser>
          {data ? (
            <>
              <Username href={data.url} open={open} {...targetBlank}>{data.name}</Username>
              <Image image={data.image} onClick={this.handleClick} />
            </>
          ) : (
            <Image>
              <Loader />
            </Image>
          )}
        </ImageAndUser>
        <Arrow open={open} />
        <Menu open={open}>
          <Link href="/profile" passHref>
            <MenuItem {...autotrackParams('Session', 'Profile')}>Profile</MenuItem>
          </Link>
          <Link href="/logout" passHref>
            <MenuItem {...autotrackParams('Session', 'Logout')}>Logout</MenuItem>
          </Link>
        </Menu>
      </div>
    );
  }
}

Session.propTypes = {
  session: PropTypes.object,
  fetchSessionIfNeeded: PropTypes.func.isRequired,
};

Session.defaultProps = {
  session: {},
};


const mapStateToProps = (state) => {
  const session = getSessionState(state);

  return {
    session,
  };
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchSessionIfNeeded }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Session);
