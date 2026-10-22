import LastfmIcon from '../icons/LastfmIcon';

const LoginButton = ({ href }: { href: string }) => (
  <a
    href={href}
    title="Login with Last.fm"
    className="inline-flex flex-col items-start rounded-[5px] border border-lastfm bg-lastfm px-[25px] py-2.5 text-[13px] text-white shadow-[0_2px_0_var(--color-lastfm)] transition-[box-shadow,translate,filter] duration-250 hover:brightness-110 active:translate-y-[3px] active:shadow-none"
  >
    <span className="mb-[5px]">Login with</span>
    <LastfmIcon aria-hidden="true" />
  </a>
);

export default LoginButton;
