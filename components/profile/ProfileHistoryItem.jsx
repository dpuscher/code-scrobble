
import PropTypes from 'prop-types';
import React from 'react';
import { ListCaption, ListItem, Time } from '../../styles/profile.styles';

class ProfileHistoryItem extends React.PureComponent {
  render() {
    const {
      id, artist, title, year, barcode, time, isDeleting,
    } = this.props;
    return (
      <ListItem key={id}>
        <ListCaption disabled={isDeleting} as="a" href={`/detected/${barcode}`}>
          <span css="margin-right:1em">
            {`${artist} - ${title}`}
            {year && ` (${year})`}
          </span>
          <Time date={time} />
        </ListCaption>
      </ListItem>
    );
  }
}

ProfileHistoryItem.propTypes = {
  id: PropTypes.number.isRequired,
  artist: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  year: PropTypes.string,
  isDeleting: PropTypes.bool,
  barcode: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
};

ProfileHistoryItem.defaultProps = {
  isDeleting: false,
  year: undefined,
};

export default ProfileHistoryItem;
