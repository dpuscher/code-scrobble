import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { getHistoryState, fetchHistory } from '../../app/states/HistoryState';
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
      data, loading, deleting,
    } = this.props;
    return (
      <>
        <H3>History</H3>
        <Meta>Your recently scanned items. Tap one to scrobble it again.</Meta>
        {loading
          ? <Spinner size={30} css="margin:30px auto;display:block;" />
          : (
            <List>
              {!data.length && (
                <Fallback>
                  No entries found.
                </Fallback>
              )}
              {data.map(item => (
                <ProfileHistoryItem
                  key={item.id}
                  isDeleting={deleting.includes(item.id)}
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
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  deleting: PropTypes.array,
  fetchHistory: PropTypes.func.isRequired,
};

ProfileHistorys.defaultProps = {
  data: [],
  loading: false,
  error: null,
  deleting: [],
};

const mapStateToProps = (state) => {
  const Historys = getHistoryState(state);

  return {
    ...Historys,
  };
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchHistory }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProfileHistorys);
