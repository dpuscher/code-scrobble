import React from "react";
import { IoIosRefresh } from "react-icons/io";
import ErrorIcon from "../icons/ErrorIcon";

interface SearchReleaseErrorProps {
  code: string;
  onRetry: () => void;
}

const SearchReleaseError = ({ code, onRetry }: SearchReleaseErrorProps) => (
  <div className="absolute flex flex-col items-center justify-center w-full h-full p-[10%] text-center">
    <ErrorIcon color="#feda6a" className="w-[30%] h-auto mb-[15px]" />
    <b>
      No release found
      <br />
      {code}
    </b>
    <button
      onClick={onRetry}
      className="flex flex-col items-center w-full mt-[10%] mb-[-5%] p-[5%] appearance-none border-0 bg-transparent text-inherit cursor-pointer"
    >
      <IoIosRefresh size="30px" style={{ marginBottom: "7px" }} />
      Retry
    </button>
  </div>
);

export default SearchReleaseError;
