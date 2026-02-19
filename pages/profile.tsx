import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchSessionIfNeeded } from '../components/session/actions/sessionActions';
import { receivedSession } from '../components/session/actions/sessionActionCreators';
import { getSession } from '../lib/session';
import BackButton from '../components/ui/BackButton';
import ProfileAutoScrobbles from '../components/profile/ProfileAutoScrobbles';
import ProfileHistory from '../components/profile/ProfileHistory';
import { wrapper } from '../client/reduxStore';
import {
  H1, H2, Header, ProfileImg, Wrapper,
} from '../styles/profile.styles';

interface ProfileProps {
  session?: any;
  fetchSessionIfNeeded: () => void;
}

class Profile extends React.Component<ProfileProps, {}> {
  componentDidMount() {
    this.props.fetchSessionIfNeeded();
  }

  render() {
    const { imageLarge, name } = this.props.session || {};
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

const mapStateToProps = state => ({
  session: state.session.data,
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchSessionIfNeeded }, dispatch)
);

export const getServerSideProps = wrapper.getServerSideProps(store => async ({ req, res }) => {
  const session = await getSession(req, res);
  if (session.user) {
    await store.dispatch(receivedSession(session.user));
  }
  return { props: {} };
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Profile);
