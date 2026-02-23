import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import React from 'react';
import { fetchHistory } from './actions/historyActions';
import {
  Fallback, H3, List, Meta,
} from '../../styles/profile.styles';
import ProfileHistoryItem from './ProfileHistoryItem';
import Spinner from '../layout/Spinner';

interface ProfileHistoryProps {
  history?: any[];
  loading?: boolean;
  fetchHistory: () => void;
}

class ProfileHistory extends React.PureComponent<ProfileHistoryProps, {}> {
  componentDidMount() {
    this.props.fetchHistory();
  }

  render() {
    const { history = [], loading = true } = this.props;
    return (
      <>
        <H3>History</H3>
        <Meta>Your recently scanned items. Tap one to scrobble it again.</Meta>
        {loading
          ? <Spinner size={30} css="margin:30px auto;display:block;" />
          : (
            <List>
              {!history.length && (
                <Fallback>
                  No entries found.
                </Fallback>
              )}
              {history.map(item => (
                <ProfileHistoryItem
                  key={item.id}
                  {...item}
                />
              ))}
            </List>
          )
      }
      </>
    );
  }
}

const mapStateToProps = state => ({
  history: state.history.data,
  loading: state.history.loading,
});

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchHistory }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProfileHistory);
