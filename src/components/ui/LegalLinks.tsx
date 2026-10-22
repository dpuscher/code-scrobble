import Link from 'next/link';

const LegalLinks = () => (
  <div className="absolute right-[15px] bottom-[5px] flex text-xs/[1.15]">
    <Link href="/privacy" className="p-2.5 underline">Privacy</Link>
    <Link href="/legal" className="p-2.5 underline">Legal</Link>
  </div>
);

export default LegalLinks;
