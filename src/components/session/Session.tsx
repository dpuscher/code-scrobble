import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useSession } from '../../lib/session';
import targetBlank from '../../lib/targetBlank';

const menuItemClass = 'block w-full px-5 py-2.5 text-right leading-[normal] text-dark';

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

  // Fades in and out; invisible also takes the menu out of the tab order.
  const fade = `transition-[opacity,visibility] duration-300 ${open ? 'visible opacity-100' : 'invisible opacity-0'}`;

  return (
    <div ref={ref}>
      <div className="flex items-center">
        <a
          href={session.url ?? undefined}
          {...targetBlank}
          className={`pr-3 text-[14px] ${open ? 'opacity-100' : 'pointer-events-none opacity-0'} transition-opacity duration-300`}
          tabIndex={open ? 0 : -1}
        >
          {session.name}
        </a>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label="Account menu"
          aria-expanded={open}
          aria-haspopup="menu"
          className="z-1 size-[8vw] max-h-[50px] max-w-[50px] rounded-full bg-[#ccc] bg-cover"
          style={session.image ? { backgroundImage: `url("${session.image}")` } : undefined}
        />
      </div>
      <div
        aria-hidden
        className={`absolute right-0 h-2 w-[8vw] max-w-[50px] before:absolute before:top-0 before:left-1/2 before:size-0 before:translate-x-[-50%] before:translate-y-0.5 before:border-x-6 before:border-b-6 before:border-x-transparent before:border-b-white ${fade}`}
      />
      <div role="menu" className={`absolute right-0 mt-2 rounded-[3px] bg-white text-right text-dark ${fade}`}>
        <Link href="/profile" role="menuitem" className={menuItemClass}>Profile</Link>
        {/* Logging out changes state, so it is a POST, not a link. */}
        <form method="post" action="/logout">
          <button type="submit" role="menuitem" className={menuItemClass}>Logout</button>
        </form>
      </div>
    </div>
  );
};

export default Session;
