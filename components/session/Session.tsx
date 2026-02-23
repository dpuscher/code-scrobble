import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Router from 'next/router';
import { fetchSessionIfNeeded } from './actions/sessionActions';
import {
  Arrow, Image, ImageAndUser, Loader, Menu, MenuItem, Username,
} from './styles/Session.styles';
import targetBlank from '../../lib/targetBlank';
import { autotrackParams } from '../../lib/analytics';

interface SessionProps {
  session?: any;
  error?: any;
  fetchSessionIfNeeded: () => void;
}

class Session extends React.Component<SessionProps, { open: boolean }> {
  overlayRef = React.createRef<HTMLDivElement>();

  state = {
    open: false,
  }

  componentDidMount() {
    this.props.fetchSessionIfNeeded();
    document.addEventListener('click', this.handleClickOutside);
  }

  componentDidUpdate(prevProps: SessionProps) {
    if (!prevProps.error && this.props.error) {
      Router.push('/login');
    }
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
    const { session = {}, error = null } = this.props;

    const { open } = this.state;
    if (error) return null;
    return (
      <div ref={this.overlayRef}>
        <Head>
          <link rel="preconnect" href="https://lastfm-img2.akamaized.net" />
        </Head>
        <ImageAndUser>
          {session && session.name ? (
            <>
              <Username href={session.url} open={open} {...targetBlank}>{session.name}</Username>
              <Image image={session.image} onClick={this.handleClick} />
            </>
          ) : (
            <Image>
              <Loader />
            </Image>
          )}
        </ImageAndUser>
        <Arrow open={open} />
        <Menu open={open}>
          <Link href="/profile" passHref legacyBehavior>
            <MenuItem {...autotrackParams('Session', 'Profile')}>Profile</MenuItem>
          </Link>
          <Link href="/api/auth/logout" passHref legacyBehavior>
            <MenuItem {...autotrackParams('Session', 'Logout')}>Logout</MenuItem>
          </Link>
        </Menu>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  session: state.session.data,
  error: state.session.error,
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchSessionIfNeeded }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Session);
