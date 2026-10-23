import type { ReactNode } from 'react';
import { IoIosRefresh } from 'react-icons/io';
import ErrorIcon from '../icons/ErrorIcon';
import { CircleContent } from './CircleLayout';
import RoundButton from './RoundButton';

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
  <CircleContent role="alert">
    <ErrorIcon color="currentColor" className="mb-[15px] h-auto w-[30%] text-yellow" />
    <b>{title}</b>
    {description && <div className="my-2.5">{description}</div>}
    {onRetry && (
      <RoundButton onClick={onRetry}>
        <IoIosRefresh size="30px" aria-hidden />
        {retryLabel}
      </RoundButton>
    )}
  </CircleContent>
);

export default ErrorMessage;
