
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchSessionIfNeeded } from '../components/session/actions/sessionActions';
import { receivedSession } from '../components/session/actions/sessionActionCreators';
import BackButton from '../components/ui/BackButton';
import ProfileAutoScrobbles from '../components/profile/ProfileAutoScrobbles';
import ProfileHistory from '../components/profile/ProfileHistory';
import {
  H1, H2, Header, ProfileImg, Wrapper,
} from '../styles/profile.styles';

class Profile extends React.Component {
  static async getInitialProps({ req, store }) {
    if (req && req.user) {
      const user = req.user.toJSON();
      await store.dispatch(receivedSession(user));
    }
    return {};
  }

  componentDidMount() {
    this.props.fetchSessionIfNeeded();
  }

  render() {
    const { imageLarge, name } = this.props.session;
    return (
      <Wrapper>
        <BackButton />
        <H1>Profile</H1>
        <Header>
          <ProfileImg src={imageLarge} alt={name} />
          <H2>{name}</H2>
        </Header>
        <ProfileAutoScrobbles />
        <ProfileHistory />
      </Wrapper>
    );
  }
}

Profile.propTypes = {
  session: PropTypes.object,
  fetchSessionIfNeeded: PropTypes.func.isRequired,
};

Profile.defaultProps = {
  session: {},
};

const mapStateToProps = state => ({
  session: state.session.data,
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchSessionIfNeeded, receivedSession }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Profile);
