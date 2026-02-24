import React from "react";
import Link from "next/link";
import { ListCaption, ListItem, Time } from "../../styles/profile.styles";

interface ProfileHistoryItemProps {
  id: string;
  artist: string;
  title: string;
  year?: string;
  isDeleting?: boolean;
  barcode?: string;
  time: string;
  discogsId: number;
}

class ProfileHistoryItem extends React.PureComponent<ProfileHistoryItemProps, {}> {
  render() {
    const { id, artist, title, year, barcode, discogsId, time, isDeleting = false } = this.props;

    const barcodeParam = barcode || `id:${discogsId}`;

    return (
      <ListItem key={id}>
        <Link href={`/detected/${barcodeParam}`} passHref legacyBehavior>
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

export default ProfileHistoryItem;
