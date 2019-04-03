
import PropTypes from 'prop-types';
import React from 'react';
import Link from 'next/link';
import { ListCaption, ListItem, Time } from '../../styles/profile.styles';

class ProfileHistoryItem extends React.PureComponent {
  render() {
    const {
      id, artist, title, year, barcode, discogsId, time, isDeleting,
    } = this.props;

    const barcodeParam = barcode || `id:${discogsId}`;

    return (
      <ListItem key={id}>
        <Link href={`/detected?barcode=${barcodeParam}`} as={`/detected/${barcodeParam}`} passHref>
          <ListCaption disabled={isDeleting} as="a">
            <span css="margin-right:1em">
              {`${artist} - ${title}`}
              {year && ` (${year})`}
            </span>
            <Time date={time} />
          </ListCaption>
        </Link>
      </ListItem>
    );
  }
}

ProfileHistoryItem.propTypes = {
  id: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  year: PropTypes.string,
  isDeleting: PropTypes.bool,
  barcode: PropTypes.string,
  time: PropTypes.string.isRequired,
  discogsId: PropTypes.number.isRequired,
};

ProfileHistoryItem.defaultProps = {
  isDeleting: false,
  year: undefined,
  barcode: undefined,
};

export default ProfileHistoryItem;
