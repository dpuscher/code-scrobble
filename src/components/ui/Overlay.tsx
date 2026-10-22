import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { silver } from '../../lib/colors';
import { CloseButton, Content, Backdrop } from './styles/Overlay.styles';

type Props = {
  label: string;
  onClose: () => void;
  fullHeight?: boolean;
  children: ReactNode;
};

/** Modal panel used for the release search and the release info. */
const Overlay = ({
  label, onClose, fullHeight = false, children,
}: Props) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <Backdrop role="dialog" aria-modal="true" aria-label={label}>
      <Content $fullHeight={fullHeight}>
        <CloseButton type="button" onClick={onClose} aria-label="Close">
          <MdClose size="30" color={silver} aria-hidden />
        </CloseButton>
        {children}
      </Content>
    </Backdrop>
  );
};

export default Overlay;
