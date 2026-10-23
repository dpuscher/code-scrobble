import Logo from '../components/assets/Logo';
import LegalLinks from '../components/ui/LegalLinks';
import LoginButton from '../components/ui/LoginButton';
import { requireAnonymous } from '../server/guard';

const Index = () => (
  <div className="flex min-h-full w-full items-center justify-center py-[15px]">
    <div className="flex flex-col items-center justify-center text-center">
      <header>
        <h1 className="text-[2em]"><Logo role="img" aria-label="CodeScrobble" className="inline h-auto w-[300px] align-baseline" /></h1>
      </header>
      <main>
        <div className="max-w-[600px] px-[30px]">
          <p className="my-[30px]">
            CodeScrobble makes it easy to scrobble your CD or vinyl records to Last.fm.
          </p>
          <p className="my-[30px]">
            Just use your smartphone camera to scan the barcode, check the result and you
            are done. We also have an auto-scrobble mode, that makes scrobbling even faster.
          </p>
        </div>
        <LoginButton href="/auth/lastfm" />
      </main>
    </div>
    <LegalLinks />
  </div>
);

export const getServerSideProps = requireAnonymous;

export default Index;
