"use client";

import React from "react";
import { FiTrash2 } from "react-icons/fi";

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
    <li
      key={id}
      className="block flex items-center justify-between px-5 border-t border-grey last:border-b last:border-grey"
    >
      <span className={`flex-grow py-[10px] transition-opacity ${isDeleting ? "opacity-30" : ""}`}>
        {`${artist} - ${title}`}
        {year && ` (${year})`}
      </span>
      <button
        disabled={isDeleting}
        onClick={onDelete}
        className={`relative -right-5 p-[15px] transition-opacity border-0 bg-transparent text-inherit cursor-pointer appearance-none ${isDeleting ? "opacity-30" : ""}`}
      >
        <FiTrash2 size={16} />
      </button>
    </li>
  );
}
