import NextLink from 'next/link';
import { Link, Links } from './styles/LegalLinks.styles';

const LegalLinks = () => (
  <Links>
    <Link as={NextLink} href="/privacy">Privacy</Link>
    <Link as={NextLink} href="/legal">Legal</Link>
  </Links>
);

export default LegalLinks;
