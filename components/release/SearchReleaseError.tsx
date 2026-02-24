import React from "react";
import { IoIosRefresh } from "react-icons/io";
import { yellow } from "../../lib/colors";
import { FlexContent } from "../../styles/layout.styles";
import { ErrorIcon, RetryButton } from "../layout/styles/Error.styles";

interface SearchReleaseErrorProps {
  code: string;
  onRetry: () => void;
}

const SearchReleaseError = ({ code, onRetry }: SearchReleaseErrorProps) => (
  <FlexContent>
    <ErrorIcon color={yellow} />
    <b>
      No release found
      <br />
      {code}
    </b>
    <RetryButton onClick={onRetry}>
      <IoIosRefresh size="30px" css="margin-bottom: 7px" />
      Retry
    </RetryButton>
  </FlexContent>
);

export default SearchReleaseError;
