import NextLink from 'next/link';
import { Link, Links } from './styles/LegalLinks.styles';

const LegalLinks = () => (
  <Links>
    <NextLink href="/privacy" passHref legacyBehavior>
      <Link>Privacy</Link>
    </NextLink>
    <NextLink href="/legal" passHref legacyBehavior>
      <Link>Legal</Link>
    </NextLink>
  </Links>
);

export default LegalLinks;
