import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';
import { TrashAlt as DeleteIcon } from 'styled-icons/fa-regular';
import { deleteAutoScrobble } from '../../app/states/AutoScrobbleState';
import { DeleteButton, ListCaption, ListItem } from '../../styles/profile.styles';

class ProfileAutoScrobbleItem extends React.PureComponent {
  handleDelete = () => {
    const { id } = this.props;
    this.props.deleteAutoScrobble(id);
  }

  render() {
    const {
      id, artist, title, year, isDeleting,
    } = this.props;
    return (
      <ListItem key={id}>
        <ListCaption disabled={isDeleting}>
          {`${artist} - ${title}`}
          {year && ` (${year})`}
        </ListCaption>
        <DeleteButton disabled={isDeleting} onClick={this.handleDelete}>
          <DeleteIcon size={16} />
        </DeleteButton>
      </ListItem>
    );
  }
}

ProfileAutoScrobbleItem.propTypes = {
  id: PropTypes.number.isRequired,
  artist: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  year: PropTypes.string,
  isDeleting: PropTypes.bool,
  deleteAutoScrobble: PropTypes.func.isRequired,
};

ProfileAutoScrobbleItem.defaultProps = {
  isDeleting: false,
  year: undefined,
};

const mapDispatchToProps = dispatch => (
  bindActionCreators({ deleteAutoScrobble }, dispatch)
);

export default connect(
  null,
  mapDispatchToProps,
)(ProfileAutoScrobbleItem);
