"use client";

import React from "react";
import { TrashAlt as DeleteIcon } from "styled-icons/fa-regular";
import { DeleteButton, ListCaption, ListItem } from "../../styles/profile.styles";

interface ProfileAutoScrobbleItemProps {
  id: string;
  artist: string;
  title: string;
  year?: string;
  isDeleting?: boolean;
  onDelete: () => void;
}

export default function ProfileAutoScrobbleItem({
  id,
  artist,
  title,
  year,
  isDeleting = false,
  onDelete,
}: ProfileAutoScrobbleItemProps) {
  return (
    <ListItem key={id}>
      <ListCaption disabled={isDeleting}>
        {`${artist} - ${title}`}
        {year && ` (${year})`}
      </ListCaption>
      <DeleteButton disabled={isDeleting} onClick={onDelete}>
        <DeleteIcon size={16} />
      </DeleteButton>
    </ListItem>
  );
}
