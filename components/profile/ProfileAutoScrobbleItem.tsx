import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import React from "react";
import { TrashAlt as DeleteIcon } from "styled-icons/fa-regular";
import { deleteAutoScrobble } from "./actions/autoScrobbleActions";
import { DeleteButton, ListCaption, ListItem } from "../../styles/profile.styles";

interface ProfileAutoScrobbleItemProps {
  id: string;
  artist: string;
  title: string;
  year?: string;
  isDeleting?: boolean;
  deleteAutoScrobble: (id: string) => void;
}

class ProfileAutoScrobbleItem extends React.PureComponent<ProfileAutoScrobbleItemProps, {}> {
  handleDelete = () => {
    const { id } = this.props;
    this.props.deleteAutoScrobble(id);
  };

  render() {
    const { id, artist, title, year, isDeleting = false } = this.props;
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

const mapDispatchToProps = dispatch => bindActionCreators({ deleteAutoScrobble }, dispatch);

export default connect(null, mapDispatchToProps)(ProfileAutoScrobbleItem);
