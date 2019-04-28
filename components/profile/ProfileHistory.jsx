import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { fetchHistory } from './actions/historyActions';
import {
  Fallback, H3, List, Meta,
} from '../../styles/profile.styles';
import ProfileHistoryItem from './ProfileHistoryItem';
import Spinner from '../layout/Spinner';

class ProfileHistorys extends React.PureComponent {
  componentDidMount() {
    this.props.fetchHistory();
  }

  render() {
    const {
      history, loading,
    } = this.props;
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

ProfileHistorys.propTypes = {
  history: PropTypes.array,
  loading: PropTypes.bool,
  fetchHistory: PropTypes.func.isRequired,
};

ProfileHistorys.defaultProps = {
  history: [],
  loading: false,
};

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
)(ProfileHistorys);
