import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { getAutoScrobbleState, fetchAutoScrobbles } from '../../app/states/AutoScrobbleState';
import {
  Fallback, H3, List, Meta,
} from '../../styles/profile.styles';
import ProfileAutoScrobbleItem from './ProfileAutoScrobbleItem';
import Spinner from '../layout/Spinner';

class ProfileAutoScrobbles extends React.PureComponent {
  componentDidMount() {
    this.props.fetchAutoScrobbles();
  }

  render() {
    const {
      data, loading, deleting,
    } = this.props;
    return (
      <>
        <H3>Auto-scrobbles</H3>
        <Meta>These items are automatically scrobbled the next time they are scanned</Meta>
        {loading
          ? <Spinner size={30} css="margin:30px auto;display:block;" />
          : (
            <List>
              {!data.length && (
                <Fallback>
                  No entries found. Activate the option &quot;Auto-scrobble&quot;
                  during your next scan.
                </Fallback>
              )}
              {data.map(item => (
                <ProfileAutoScrobbleItem
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

ProfileAutoScrobbles.propTypes = {
  data: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.any,
  deleting: PropTypes.array,
  fetchAutoScrobbles: PropTypes.func.isRequired,
};

ProfileAutoScrobbles.defaultProps = {
  data: [],
  loading: false,
  error: null,
  deleting: [],
};

const mapStateToProps = (state) => {
  const autoScrobbles = getAutoScrobbleState(state);

  return {
    ...autoScrobbles,
  };
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({ fetchAutoScrobbles }, dispatch)
);

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ProfileAutoScrobbles);
