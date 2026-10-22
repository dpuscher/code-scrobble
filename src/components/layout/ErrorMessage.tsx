import type { ReactNode } from 'react';
import { IoIosRefresh } from 'react-icons/io';
import { yellow } from '../../lib/colors';
import { FlexContent } from '../../styles/layout.styles';
import { ErrorDescription, ErrorIcon, RetryButton } from './styles/Error.styles';

type Props = {
  title: ReactNode;
  description?: ReactNode;
  retryLabel?: string;
  onRetry?: () => void;
};

/** Error state inside the round content area, optionally with a retry button. */
const ErrorMessage = ({
  title, description, retryLabel = 'Retry', onRetry,
}: Props) => (
  <FlexContent role="alert">
    <ErrorIcon color={yellow} />
    <b>{title}</b>
    {description && <ErrorDescription>{description}</ErrorDescription>}
    {onRetry && (
      <RetryButton type="button" onClick={onRetry}>
        <IoIosRefresh size="30px" aria-hidden />
        {retryLabel}
      </RetryButton>
    )}
  </FlexContent>
);

export default ErrorMessage;
