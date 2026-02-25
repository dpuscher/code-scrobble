import React from "react";
import Link from "next/link";
import TimeAgo from "react-timeago";

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
      <li
        key={id}
        className="block flex items-center justify-between px-5 border-t border-grey last:border-b last:border-grey"
      >
        <Link
          href={`/detected/${barcodeParam}`}
          className={`flex-grow py-[10px] no-underline transition-opacity ${isDeleting ? "opacity-30" : ""}`}
        >
          <span style={{ marginRight: "1em" }}>
            {`${artist} - ${title}`}
            {year && ` (${year})`}
          </span>
          <span className="inline-block opacity-50 text-[12px] whitespace-nowrap">
            <TimeAgo date={time} />
          </span>
        </Link>
      </li>
    );
  }
}

export default ProfileHistoryItem;
