import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import Link from 'next/link';
import { fetchSessionIfNeeded } from './actions/sessionActions';
import {
  Arrow, Image, ImageAndUser, Loader, Menu, MenuItem, Username,
} from './styles/Session.styles';
import targetBlank from '../../lib/targetBlank';

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
    const { session, error } = this.props;

    const { open } = this.state;
    if (error) return null;
    return (
      <div ref={this.overlayRef}>
        <ImageAndUser>
          {session && session.name ? (
            <>
              <Username href={session.url} open={open} {...targetBlank}>{session.name}</Username>
              <Image image={session.image} onClick={this.handleClick} role="button" aria-label="Account menu" aria-expanded={open} />
            </>
          ) : (
            <Image>
              <Loader />
            </Image>
          )}
        </ImageAndUser>
        <Arrow open={open} />
        <Menu open={open}>
          <MenuItem as={Link} href="/profile">Profile</MenuItem>
          {/* Plain link: /logout is an API route, not a page. */}
          <MenuItem as="a" href="/logout">Logout</MenuItem>
        </Menu>
      </div>
    );
  }
}

Session.propTypes = {
  session: PropTypes.object,
  error: PropTypes.any,
  fetchSessionIfNeeded: PropTypes.func.isRequired,
};

Session.defaultProps = {
  session: {},
  error: null,
};


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
