import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSession } from '../../lib/session';
import targetBlank from '../../lib/targetBlank';
import {
  Arrow, Avatar, AvatarAndUser, Menu, MenuItem, Username,
} from './styles/Session.styles';

/** Avatar with a menu for the profile and logout. */
const Session = () => {
  const session = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  if (!session) return null;

  return (
    <div ref={ref}>
      <AvatarAndUser>
        <Username href={session.url ?? undefined} $open={open} tabIndex={open ? 0 : -1} {...targetBlank}>
          {session.name}
        </Username>
        <Avatar
          type="button"
          $image={session.image}
          onClick={() => setOpen((value) => !value)}
          aria-label="Account menu"
          aria-expanded={open}
          aria-haspopup="menu"
        />
      </AvatarAndUser>
      <Arrow $open={open} />
      <Menu $open={open} role="menu" hidden={!open}>
        <MenuItem as={Link} href="/profile" role="menuitem">Profile</MenuItem>
        {/* Logging out changes state, so it is a POST, not a link. */}
        <form method="post" action="/logout">
          <MenuItem type="submit" role="menuitem">Logout</MenuItem>
        </form>
      </Menu>
    </div>
  );
};

export default Session;
